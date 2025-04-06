import {
  ShiftApi,
  CompanyApi,
  AuthApi,
  Configuration,
  LoginRequest,
  RefreshRequest,
} from "../../backend-api";

const API_BASE_URL = "http://localhost:3000";
export const ACCESS_TOKEN_KEY = "quickshift_access_token";
export const REFRESH_TOKEN_KEY = "quickshift_refresh_token";

export class BackendAPI {
  static shiftApi: ShiftApi;
  static companyApi: CompanyApi;
  static authApi: AuthApi;
  static isAuthenticated: boolean = false;

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

    // Update authentication state
    this.isAuthenticated = !!token;

    return this.isAuthenticated;
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
      this.isAuthenticated = true;
    } else {
      this.isAuthenticated = false;
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
      this.isAuthenticated = false;
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
        this.isAuthenticated = true;
        return result.data.accessToken;
      } else {
        this.isAuthenticated = false;
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Checks if the user is authenticated and optionally attempts to refresh the token
   * @param attemptRefresh Whether to attempt refreshing the token or not
   * @returns A promise resolving to a boolean indicating if the user is authenticated
   */
  static async checkAuth(attemptRefresh = true): Promise<boolean> {
    const hasToken = this.initialize();

    if (!hasToken) {
      return false;
    }

    // If no refresh attempt requested, just return current state
    if (!attemptRefresh) {
      return this.isAuthenticated;
    }

    // Try to refresh the token to verify it's still valid
    try {
      await this.refresh();
      return true;
    } catch (error) {
      console.error("Authentication validation failed:", error);
      return false;
    }
  }

  static updateAuthToken = (token: string) => {
    this.initialize(token);
  };

  static logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.isAuthenticated = false;
    this.initialize();
  };
}
