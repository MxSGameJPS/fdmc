import AsyncStorage from "@react-native-async-storage/async-storage";
import * as rssParser from "react-native-rss-parser";

// Obter os posts armazenados localmente
export async function getStoredBlogPosts() {
  try {
    const postsJson = await AsyncStorage.getItem("blogPosts");
    return postsJson ? JSON.parse(postsJson) : [];
  } catch (error) {
    console.error("Erro ao obter posts do blog armazenados:", error);
    return [];
  }
}

// Buscar novos posts do feed e atualizar o armazenamento local
export async function fetchAndUpdateBlogPosts() {
  try {
    const rssFeedUrl = "https://fogaodomeucoracao.com.br/feed";
    console.log("Buscando posts do blog em:", rssFeedUrl);

    const response = await fetch(rssFeedUrl);

    if (!response.ok) {
      throw new Error(`Resposta do feed não ok: ${response.status}`);
    }

    const responseText = await response.text();

    // Fazer o parse do feed
    let parsedFeed;
    try {
      parsedFeed = await rssParser.parse(responseText);
    } catch (parseError) {
      console.error("Erro ao fazer parse do feed:", parseError);
      return getStoredBlogPosts();
    }

    // Verificar se o feed tem itens
    if (!parsedFeed || !parsedFeed.items || parsedFeed.items.length === 0) {
      console.log("Feed do blog não contém itens");
      return getStoredBlogPosts();
    }

    // Processar os itens do feed
    const posts = parsedFeed.items.map((item) => {
      // Obter dados básicos do post
      const id = item.id || item.guid;
      const title = item.title || "Sem título";
      const content = item.content || "";
      const description = item.description || "";
      const publishedAt = item.published || new Date().toISOString();
      const link =
        item.links && item.links.length > 0 ? item.links[0].url : null;
      const author =
        item.authors && item.authors.length > 0
          ? item.authors[0].name
          : "Fogão do Meu Coração";
      const categories = item.categories
        ? item.categories.map((c) => c.name)
        : [];

      // Criar texto limpo e resumo
      const cleanContent = stripHtml(content || description);
      const excerpt = createExcerpt(cleanContent);

      return {
        id,
        title,
        content: content || description,
        cleanContent,
        excerpt,
        imageUrl,
        link,
        publishedAt,
        author,
        categories,
      };
    });

    // Salvar os posts localmente
    await AsyncStorage.setItem("blogPosts", JSON.stringify(posts));
    await AsyncStorage.setItem("blogLastUpdated", new Date().toISOString());

    console.log(`Obtidos e salvos ${posts.length} posts do blog`);
    return posts;
  } catch (error) {
    console.error("Erro ao buscar posts do blog:", error);
    return getStoredBlogPosts();
  }
}

// Buscar posts com verificação de cache
export async function getBlogPosts(forceRefresh = false) {
  try {
    // Verificar se precisamos atualizar
    const lastUpdated = await AsyncStorage.getItem("blogLastUpdated");
    const currentTime = new Date().getTime();
    const needsUpdate =
      forceRefresh ||
      !lastUpdated ||
      currentTime - new Date(lastUpdated).getTime() > 30 * 60 * 1000; // 30 minutos

    if (needsUpdate) {
      return await fetchAndUpdateBlogPosts();
    } else {
      return await getStoredBlogPosts();
    }
  } catch (error) {
    console.error("Erro ao obter posts do blog:", error);
    return getStoredBlogPosts();
  }
}

// Obter um único post por ID
export async function getBlogPostById(postId) {
  try {
    const posts = await getStoredBlogPosts();
    return posts.find((post) => post.id === postId) || null;
  } catch (error) {
    console.error("Erro ao obter post específico:", error);
    return null;
  }
}

// Função para extrair posts diretamente do XML
export async function fetchPostsFromXml() {
  try {
    const rssFeedUrl = "https://fogaodomeucoracao.com.br/feed";
    console.log("Buscando feed XML do blog:", rssFeedUrl);

    const response = await fetch(rssFeedUrl);

    if (!response.ok) {
      throw new Error(`Resposta do feed não ok: ${response.status}`);
    }

    const xml = await response.text();

    // Encontrar todos os itens no XML
    const itemsRegex = /<item>([\s\S]*?)<\/item>/g;
    const itemMatches = [...xml.matchAll(itemsRegex)];

    if (!itemMatches || itemMatches.length === 0) {
      console.log("Nenhum item encontrado no XML");
      return [];
    }

    // Processar cada item
    const posts = itemMatches.map((match) => {
      const itemXml = match[0];

      // Extrair os dados do item
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : "Sem título";

      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1] : null;

      const guidMatch = itemXml.match(/<guid[^>]*>(.*?)<\/guid>/);
      const guid = guidMatch ? guidMatch[1] : `post-${Date.now()}`;

      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      const pubDate =
        pubDateMatch && pubDateMatch[1]
          ? new Date(pubDateMatch[1]).toISOString()
          : new Date().toISOString();

      const creatorMatch = itemXml.match(
        /<dc:creator>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/dc:creator>/
      );
      const creator = creatorMatch ? creatorMatch[1] : "Fogão do Meu Coração";

      // Extrair categorias
      const categoryRegex =
        /<category>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/category>/g;
      const categoryMatches = [...itemXml.matchAll(categoryRegex)];
      const categories = categoryMatches.map((m) => m[1]);

      // Extrair conteúdo
      const contentMatch = itemXml.match(
        /<content:encoded>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/content:encoded>/
      );
      const content = contentMatch ? contentMatch[1] : "";

      // Extrair descrição
      const descMatch = itemXml.match(
        /<description>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/description>/
      );
      const description = descMatch ? descMatch[1] : "";

      // Extrair imagem (media:content)
      const mediaMatch = itemXml.match(
        /<media:content\s+url="([^"]+)"\s+medium="image">/
      );
      const imageUrl = mediaMatch ? mediaMatch[1] : null;

      // Criar texto limpo e resumo
      const cleanContent = stripHtml(content || description);
      const excerpt = createExcerpt(cleanContent);

      console.log(`Post: ${title} | Imagem: ${imageUrl || "Nenhuma"}`);

      return {
        id: guid,
        title,
        content,
        cleanContent,
        excerpt,
        imageUrl,
        link,
        publishedAt: pubDate,
        author: creator,
        categories,
      };
    });

    // Salvar os posts localmente
    await AsyncStorage.setItem("blogPosts", JSON.stringify(posts));
    await AsyncStorage.setItem("blogLastUpdated", new Date().toISOString());

    console.log(`Extraídos e salvos ${posts.length} posts do XML`);
    return posts;
  } catch (error) {
    console.error("Erro ao extrair posts do XML:", error);
    return getStoredBlogPosts();
  }
}

// Funções auxiliares
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createExcerpt(text, maxLength = 150) {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  const limitedText = text.substring(0, maxLength);
  const lastSpace = limitedText.lastIndexOf(" ");

  if (lastSpace > 0) {
    return limitedText.substring(0, lastSpace) + "...";
  }

  return limitedText + "...";
}
