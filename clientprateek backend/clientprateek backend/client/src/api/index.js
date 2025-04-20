import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this if your backend runs on a different port
});

export default api;
