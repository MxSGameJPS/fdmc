// Função para extrair a primeira imagem de conteúdo HTML
export function extractFirstImageFromHtml(html) {
  if (!html) return null;

  // Tentar encontrar tag de imagem
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const imgMatch = html.match(imgRegex);

  if (imgMatch && imgMatch[1]) {
    // Limpar a URL da imagem
    let imageUrl = imgMatch[1];

    // Verificar se a URL é relativa e corrigir se necessário
    if (imageUrl.startsWith("/")) {
      imageUrl = `https://fogaodomeucoracao.com.br${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      imageUrl = `https://fogaodomeucoracao.com.br/${imageUrl}`;
    }

    return imageUrl;
  }

  // Tentar encontrar atributo data-src (comum em lazy loading)
  const dataSrcRegex = /<img[^>]+data-src="([^">]+)"/;
  const dataSrcMatch = html.match(dataSrcRegex);

  if (dataSrcMatch && dataSrcMatch[1]) {
    let imageUrl = dataSrcMatch[1];

    // Verificar se a URL é relativa e corrigir se necessário
    if (imageUrl.startsWith("/")) {
      imageUrl = `https://fogaodomeucoracao.com.br${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      imageUrl = `https://fogaodomeucoracao.com.br/${imageUrl}`;
    }

    return imageUrl;
  }

  // Tentar encontrar estilo de fundo com URL
  const bgImageRegex = /background-image:\s*url\(['"]?([^'")]+)['"]?\)/;
  const bgMatch = html.match(bgImageRegex);

  if (bgMatch && bgMatch[1]) {
    let imageUrl = bgMatch[1];

    // Verificar se a URL é relativa e corrigir se necessário
    if (imageUrl.startsWith("/")) {
      imageUrl = `https://fogaodomeucoracao.com.br${imageUrl}`;
    } else if (!imageUrl.startsWith("http")) {
      imageUrl = `https://fogaodomeucoracao.com.br/${imageUrl}`;
    }

    return imageUrl;
  }

  return null;
}

// Função para limpar HTML e extrair texto
export function stripHtml(html) {
  if (!html) return "";

  // Remover todas as tags HTML
  return (
    html
      .replace(/<[^>]+>/g, " ")
      // Substituir múltiplos espaços por um único
      .replace(/\s+/g, " ")
      // Remover espaços no início e fim
      .trim()
  );
}

// Função para criar um resumo a partir de texto
export function createExcerpt(text, maxLength = 150) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  // Encontrar o último espaço antes do limite para não cortar palavras
  const limitedText = text.substring(0, maxLength);
  const lastSpace = limitedText.lastIndexOf(" ");

  if (lastSpace > 0) {
    return limitedText.substring(0, lastSpace) + "...";
  }

  return limitedText + "...";
}
