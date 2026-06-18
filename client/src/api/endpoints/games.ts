import api from '../axios';
import type { Game, ApiResponse } from '../../types';

export const createGame = async (data: {
  title: string;
  slug: string;
  description?: string;
  image?: File;
}) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('slug', data.slug);
  if (data.description) formData.append('description', data.description);
  if (data.image) formData.append('image', data.image);

  const response = await api.post('/v1/api/games', formData, {
    headers: data.image ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const getGameById = async (gameId: string) => {
  const response = await api.get(`/v1/api/games/${gameId}`);
  const respData = response.data;
  if (respData && typeof respData === 'object' && !('data' in respData)) {
    return { data: respData };
  }
  return respData;
};

export const getGames = async (): Promise<ApiResponse<Game[]>> => {
  const response = await api.get('/v1/api/games');
  const resp = response.data;
  if (Array.isArray(resp)) {
    return { data: resp } as unknown as ApiResponse<Game[]>;
  }
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return resp as ApiResponse<Game[]>;
  }
  return { data: [] } as ApiResponse<Game[]>;
};

export const updateGame = async (
  gameId: string,
  data: { title?: string; slug?: string; description?: string; image?: File }
) => {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.slug) formData.append('slug', data.slug);
  if (data.description) formData.append('description', data.description);
  if (data.image) formData.append('image', data.image);

  const response = await api.put(`/v1/api/games/${gameId}`, formData, {
    headers: data.image ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const deleteGame = async (gameId: string) => {
  const response = await api.delete(`/v1/api/games/${gameId}`);
  return response.data;
};
