import axios, { AxiosInstance } from "axios";

class AxiosHttpClient {
  private static instance: AxiosInstance;
  private static tokenInterceptorId: number | null = null;

  private constructor() {} // Prevent direct instantiation

  public static init(baseUrl: string, timeout: number = 10000): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({ baseURL: baseUrl, timeout });
    }
    return this.instance;
  }

  public static setToken(token: string): void {
    if (this.tokenInterceptorId !== null) {
      this.instance.interceptors.request.eject(this.tokenInterceptorId);
    }

    this.tokenInterceptorId = this.instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public static request() {
    return this.instance;
  }
}

export default AxiosHttpClient;
