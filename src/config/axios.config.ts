import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://api.antic-browser.com:3020',
});
