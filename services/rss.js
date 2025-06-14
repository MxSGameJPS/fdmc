// services/rss.js
import * as rssParser from 'react-native-rss-parser';

const RSS_URL = 'https://fogaodomeucoracao.com.br/feed'; // Substitua pela URL correta

export const fetchBlogPosts = async () => {
  try {
    const response = await fetch(RSS_URL);
    const responseData = await response.text();
    const rss = await rssParser.parse(responseData);
    
    return rss.items.map(item => {
      // Extrai a URL da imagem do conteúdo (específico para cada feed)
      const regex = /<img[^>]+src="([^">]+)"/;
      const match = item.description ? item.description.match(regex) : null;
      const imageUrl = match ? match[1] : null;
      
      return {
        id: item.id,
        title: item.title,
        description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
        link: item.links[0].url,
        publishedAt: item.published,
        type: 'blog',
        imageUrl: imageUrl
      };
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return [];
  }
};