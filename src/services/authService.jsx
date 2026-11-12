
import apiConfig from '../config/apiConfig';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Register
export async function register(data) {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('fitnessGoal', data.fitnessGoal);
  formData.append('profilePic', data.profilePic);

  const response = await apiConfig.post(
    '/auth/register',
    formData
  );

  return response.data;
}

export async function login(email, password) {
  const response = await apiConfig.post(
    '/auth/login',
    { email, password }
  );

  return response.data;
}

export async function updateNotificationSettings(enabled) {
  const response = await apiConfig.post(
    '/user/Notification',
    {
      notificationsEnabled: enabled
    },
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
}

export async function getUserProfile() {
  const response = await apiConfig.get(
    '/user/profile',
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
}
