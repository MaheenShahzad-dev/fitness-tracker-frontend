
import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};


export const submitSupport = async (data) => {
  const response = await apiConfig.post('/utility/support', {
    subject: data.subject,
    message: data.message,
    type: data.category === 'other'
      ? 'Feedback'
      : data.category === 'technical'
        ? 'Bug Report'
        : 'Support',
  });

  return response.data;
};
