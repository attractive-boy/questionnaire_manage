import api from '../utils/api';

export interface LoginParams {
  username: string;
  password: string;
}

export interface SaTokenInfo {
  tokenName?: string;
  tokenValue?: string;
  isLogin?: boolean;
  loginId?: any;
  loginType?: string;
  tokenTimeout?: number;
  sessionTimeout?: number;
  tokenSessionTimeout?: number;
  tokenActiveTimeout?: number;
  loginDevice?: string;
  tag?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: T;
}

// 登录服务
export const login = async (params: LoginParams): Promise<ApiResponse<SaTokenInfo>> => {
  try {
    const response = await api.post<ApiResponse<SaTokenInfo>>('/manager/user/login', params);
    
    // 如果登录成功，保存token到localStorage
    if (response.data?.success && response.data?.data?.tokenValue) {
      localStorage.setItem('token', response.data.data.tokenValue);
    }
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: '登录请求失败，请检查网络连接',
    };
  }
};

// 登出服务
export const logout = () => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('token');
};