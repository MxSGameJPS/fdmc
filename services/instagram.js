import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import * as rssParser from 'react-native-rss-parser';
import Card from '../card';

export default function InstagramFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      // Feed RSS do Instagram que você criou no RSS.app
      const rssFeedUrl = 'https://rss.app/feeds/DlcJyIwzZWwEy4Uu.xml';
      
      const response = await fetch(rssFeedUrl);
      const responseText = await response.text();
      const feed = await rssParser.parse(responseText);
      
      console.log('Feed obtido com sucesso:', feed.title);
      
      const formattedPosts = feed.items.map(item => {
        // Extrair a URL da imagem da descrição HTML
        const imageUrl = extractImageFromContent(item.content);
        
        return {
          id: item.id,
          title: item.title || 'Post do Instagram',
          content: cleanDescription(item.description),
          imagem: imageUrl,
          link: item.links[0]?.url,
          date: new Date(item.published)
        };
      });
      
      setPosts(formattedPosts);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar posts do Instagram:', error);
      setError('Não foi possível carregar os posts do Instagram. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para extrair URL da imagem do conteúdo HTML
  const extractImageFromContent = (content) => {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
  };

  // Função para limpar a descrição HTML
  const cleanDescription = (html) => {
    if (!html) return '';
    // Remove tags HTML
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d1ac00" />
        <Text style={styles.loadingText}>Carregando posts do Instagram...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchInstagramPosts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Instagram</Text>
      {posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              title={item.title}
              content={item.content}
              imagem={item.imagem}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhum post encontrado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#d1ac00',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  }
});