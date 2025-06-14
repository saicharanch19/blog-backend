import axios from 'axios';

const API = axios.create({
  baseURL: 'https://blog-backend-1-dnoe.onrender.com', // your deployed backend
});

export default API;
