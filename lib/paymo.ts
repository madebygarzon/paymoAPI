import axios, { AxiosInstance } from 'axios';

export function createPaymoClient(apiKey: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://app.paymoapp.com/api',
    headers: {
      Accept: 'application/json',
    },
    auth: {
      username: apiKey,
      password: 'X',
    },
  });
}

export function getEnvPaymoClient(): AxiosInstance {
  const key = process.env.PAYMO_API_KEY;
  if (!key) {
    throw new Error('PAYMO_API_KEY not defined in environment');
  }
  return createPaymoClient(key);
}
