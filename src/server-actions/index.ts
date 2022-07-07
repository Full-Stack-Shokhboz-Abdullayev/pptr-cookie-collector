import { api } from '../config/axios.config';
import { Credentials } from '../typings/Credentials.type';

export const getAuthToken = async (credentials: Credentials) => {
  return (
    await api.post('/auth/sign-in', {
      ...credentials,
    })
  ).data.accessToken;
};

export const getProfile = async (token: string, profileId: string) => {
  return (
    await api.get('/user/profile?profileId=' + profileId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).data;
};

export const updateProfileCookies = async (
  token: string,
  profileId: string,
  cookies: string[] | string,
) => {
  return (
    await api.patch(
      `/user/profile?profileId=${profileId}`,
      {
        params: {
          cookies: {
            data: cookies,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  ).data.params.cookies;
};
