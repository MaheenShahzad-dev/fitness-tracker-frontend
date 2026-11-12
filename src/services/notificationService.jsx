import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export async function getNotifications(params = {}) {
  const response = await apiConfig.get('/notifications', {
    headers: getAuthHeaders(),
    params,
  });

  return response.data;
}

export async function markNotificationRead(id) {
  const response = await apiConfig.patch(
    `/notifications/${id}/read`,
    {},
    { headers: getAuthHeaders() }
  );

  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiConfig.patch(
    '/notifications/read-all',
    {},
    { headers: getAuthHeaders() }
  );

  return response.data;
}

export async function deleteNotification(id) {
  const response = await apiConfig.delete(`/notifications/${id}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
}

export async function clearAllNotifications() {
  const response = await apiConfig.delete('/notifications', {
    headers: getAuthHeaders(),
  });

  return response.data;
}