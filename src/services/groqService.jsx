import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getGroq(query) {
  const response = await apiConfig.get('/groq/groq-ai', {
    params: { query },
    headers: getAuthHeaders(),
  });

  return response.data;
}