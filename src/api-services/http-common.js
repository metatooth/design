import axios from 'axios';

export const HTTP = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {'Authorization':
              'Metaspace-Token api_key='+process.env.VUE_APP_API_KEY},
});
