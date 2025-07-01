import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://hearttestback.djjp.cn",
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在这里添加通用的请求头或处理请求前的逻辑
    // 如果本地存储token，就添加到请求头中
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 在这里处理通用的错误逻辑
    return Promise.reject(error);
  }
);

export default api;
