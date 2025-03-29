import axios from 'axios';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const UNSPLASH_ACCESS_KEY = 'vQTW7QASZaS3PCWgM0kNaz0dTqK4aNWzTGl-FqjA2t8'; // Replace with your Unsplash API key

export const fetchSceneryImages = async (query: string) => {
  try {
    const response = await axios.get(UNSPLASH_API_URL, {
      params: { query, per_page: 10 },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });
    return response.data.results.map((image: any) => image.urls.small);
  } catch (error) {
    console.error('Error fetching images:', error);
    // Provide fallback images in case of an error
    return [
      'https://via.placeholder.com/150/0000FF/808080?text=Image1',
      'https://via.placeholder.com/150/FF0000/FFFFFF?text=Image2',
      'https://via.placeholder.com/150/00FF00/000000?text=Image3',
    ];
  }
};
