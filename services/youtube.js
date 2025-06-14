// services/youtube.js
const API_KEY = 'AIzaSyAWMupTOwaGu6aAC2cdPeOWato6pZj6piM';
const CHANNEL_ID = 'UCGYyVRxyMn-7YuConcWEqYq'; // Pergunte ao contratante o ID do canal

export const fetchYouTubeVideos = async () => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('YouTube API error:', data.error.message);
      return [];
    }
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      type: 'youtube',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
};