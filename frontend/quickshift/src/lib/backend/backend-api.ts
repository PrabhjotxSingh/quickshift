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

    // Extra logging to help debug token issues
    if (token) {
      console.log(`Token found, initializing API with token: ${token.substring(0, 10)}...`);
    } else {
      console.warn("No token found during API initialization");
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
    console.log("Attempting login for:", loginRequest.username);
    const result = await this.authApi.login(loginRequest);
    if (result.status === 200 && result.data.accessToken != null) {
      console.log("Login successful, storing tokens");
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
   * @param attemptRefresh Whether to attempt refreshing the token (default true)
   */
  static async checkAuth(attemptRefresh = false): Promise<boolean> {
    const hasToken = this.initialize();

    if (!hasToken) {
      return false;
    }

    // Skip token refresh if not needed
    if (!attemptRefresh) {
      return this.isAuthenticated;
    }

    try {
      await this.refresh();
      return true;
    } catch (error) {
      console.error("Authentication validation failed:", error);
      return false;
    }
  }

  static updateAuthToken = (token: string) => {
    console.log(`Updating auth token: ${token.substring(0, 10)}...`);
    // First store the token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    // Then initialize the API with the new token
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
