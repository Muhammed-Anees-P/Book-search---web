import axios from "axios";

const Axios = axios.create({
  baseURL: "http://localhost:5000/",
  headers: {
    "Content-type": "application/json"
  }
});


Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

Axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

export default Axios;
