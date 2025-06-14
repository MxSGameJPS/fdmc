import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchPostsFromXml } from '../../services/blogService'; // Importar a função que extrai posts do XML
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export default function BlogFeed({ limit = 10, showTitle = true, showViewMore = true }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Usar a nova função que extrai as imagens corretamente
      const blogPosts = await fetchPostsFromXml();
      // Limitar a quantidade de posts conforme o parâmetro
      setPosts(blogPosts.slice(0, limit));
     
    } catch (error) {
      console.error('Erro ao carregar posts do blog para feed:', error);
      setError('Falha ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMM');
  };

  const navigateToBlog = () => {
    router.push('/(tabs)/Blog');
  };

  const openPost = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => 
        console.error('Erro ao abrir URL do post:', err)
      );
    }
  };

  const renderPostItem = ({ item }) => {
    // Determinar a categoria principal para exibição
    const mainCategory = item.categories && item.categories.length > 0 
      ? item.categories[0] 
      : "Notícia";
    
    return (
      <Pressable 
        style={styles.postCard}
        onPress={() => openPost(item.link)}
      >
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.postImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="newspaper-outline" size={36} color="#444" />
          </View>
        )}
        
        <View style={styles.postContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{mainCategory}</Text>
          </View>
          
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
          
          <Text style={styles.postDate}>{formatDate(item.publishedAt)}</Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadPosts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Text style={styles.title}>Últimas Notícias</Text>
          {showViewMore && (
            <Pressable style={styles.viewMoreButton} onPress={navigateToBlog}>
              <Text style={styles.viewMoreText}>Ver mais</Text>
              <Ionicons name="arrow-forward" size={16} color="#666" />
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma notícia disponível</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    color: '#ddd',
    marginRight: 4,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  postCard: {
    width: 220,
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    marginHorizontal: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  postImage: {
    width: '100%',
    height: 120,
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    padding: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1ac00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    lineHeight: 18,
  },
  postDate: {
    fontSize: 12,
    color: '#aaa',
  },
  emptyContainer: {
    width: 220,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
  },
});