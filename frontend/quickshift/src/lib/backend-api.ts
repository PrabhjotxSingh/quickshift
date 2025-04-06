import {
  ShiftApi,
  CompanyApi,
  AuthApi,
  Configuration,
  LoginRequest,
  RefreshRequest,
} from "../backend-api";

const API_BASE_URL = "http://localhost:3000";
export const ACCESS_TOKEN_KEY = "quickshift_access_token";
export const REFRESH_TOKEN_KEY = "quickshift_refresh_token";

export class BackendAPI {
  static shiftApi: ShiftApi;
  static companyApi: CompanyApi;
  static authApi: AuthApi;

  static initialize = (token?: string) => {
    // Try to get token from localStorage if not provided
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
    }

    const config = new Configuration({
      basePath: API_BASE_URL,
      baseOptions: token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    });
    this.shiftApi = new ShiftApi(config);
    this.companyApi = new CompanyApi(config);
    this.authApi = new AuthApi(config);
  };

  static async login(loginRequest: LoginRequest) {
    const result = await this.authApi.login(loginRequest);
    if (result.status === 200 && result.data.accessToken != null) {
      // Save tokens to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
        }
      }
      this.updateAuthToken(result.data.accessToken);
    } else {
      throw new Error("Invalid login");
    }
  }

  static async refresh() {
    if (typeof window === "undefined") {
      throw new Error("Cannot refresh token outside of browser context");
    }

    const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!currentToken || !refreshToken) {
      throw new Error("No tokens available for refresh");
    }

    try {
      const refreshRequest: RefreshRequest = {
        token: currentToken,
        refreshToken: refreshToken,
      };

      const result = await this.authApi.refreshTokens(refreshRequest);

      if (result.status === 200 && result.data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
        }
        this.updateAuthToken(result.data.accessToken);
        return result.data.accessToken;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      throw error;
    }
  }

  static updateAuthToken = (token: string) => {
    this.initialize(token);
  };
}
