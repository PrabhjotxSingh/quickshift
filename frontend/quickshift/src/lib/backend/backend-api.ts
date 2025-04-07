import {
  ShiftApi,
  CompanyApi,
  AuthApi,
  Configuration,
  LoginRequest,
  RefreshRequest,
} from "../../backend-api";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://11976zm8eb.execute-api.us-east-2.amazonaws.com/dev/";
export const ACCESS_TOKEN_KEY = "quickshift_access_token";
export const REFRESH_TOKEN_KEY = "quickshift_refresh_token";

// Cookie names that match the backend
export const ACCESS_TOKEN_COOKIE = "access-token";
export const REFRESH_TOKEN_COOKIE = "refresh-token";

export class BackendAPI {
  static shiftApi: ShiftApi;
  static companyApi: CompanyApi;
  static authApi: AuthApi;
  static isAuthenticated: boolean = false;

  static initialize = (token?: string) => {
    // Try to get token from cookies if not provided
    if (!token && typeof window !== "undefined") {
      token = this.getCookie(ACCESS_TOKEN_COOKIE) || undefined;
    }

    const config = new Configuration({
      basePath: API_BASE_URL,
      baseOptions: {
        withCredentials: true, // Enable sending cookies with requests
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      },
    });
    this.shiftApi = new ShiftApi(config);
    this.companyApi = new CompanyApi(config);
    this.authApi = new AuthApi(config);

    // Update authentication state
    this.isAuthenticated = !!token;

    return this.isAuthenticated;
  };

  static async login(loginRequest: LoginRequest) {
    try {
      const result = await this.authApi.login(loginRequest);
      if (result.status === 200 && result.data.accessToken != null) {
        // The backend will set the cookies via setTokenResponse
        // We just need to update our authentication state
        this.isAuthenticated = true;

        // For backward compatibility, also store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
          if (result.data.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
          }
        }

        this.updateAuthToken(result.data.accessToken);
        return true;
      } else {
        this.isAuthenticated = false;
        throw new Error("Invalid login");
      }
    } catch (error) {
      this.isAuthenticated = false;
      throw error;
    }
  }

  static async refresh() {
    if (typeof window === "undefined") {
      throw new Error("Cannot refresh token outside of browser context");
    }

    const currentToken = this.getCookie(ACCESS_TOKEN_COOKIE);
    const refreshToken = this.getCookie(REFRESH_TOKEN_COOKIE);

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
        // The backend will set the cookies via setTokenResponse
        this.isAuthenticated = true;

        // For backward compatibility, also store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(ACCESS_TOKEN_KEY, result.data.accessToken);
          if (result.data.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, result.data.refreshToken);
          }
        }

        this.updateAuthToken(result.data.accessToken);
        return result.data.accessToken;
      } else {
        this.isAuthenticated = false;
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      this.isAuthenticated = false;
      throw error;
    }
  }

  /**
   * Checks if the user is authenticated and optionally attempts to refresh the token
   * @param attemptRefresh Whether to attempt refreshing the token (default true)
   */
  static async checkAuth(attemptRefresh = false): Promise<boolean> {
    // First check if we have cookies
    const hasAccessTokenCookie = !!this.getCookie(ACCESS_TOKEN_COOKIE);
    const hasRefreshTokenCookie = !!this.getCookie(REFRESH_TOKEN_COOKIE);

    // If we have both cookies, we're authenticated
    if (hasAccessTokenCookie && hasRefreshTokenCookie) {
      this.isAuthenticated = true;

      // Only attempt refresh if requested
      if (attemptRefresh) {
        try {
          await this.refresh();
          return true;
        } catch (error) {
          console.error("Authentication validation failed:", error);
          return false;
        }
      }

      return true;
    }

    // If we don't have cookies, check localStorage for backward compatibility
    const hasLocalStorageToken = !!localStorage.getItem(ACCESS_TOKEN_KEY);
    if (hasLocalStorageToken) {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.initialize(token || undefined);
      return this.isAuthenticated;
    }

    // No authentication found
    this.isAuthenticated = false;
    return false;
  }

  static updateAuthToken = (token: string) => {
    this.initialize(token);
  };

  // Helper method to delete a cookie
  static deleteCookie(name: string) {
    if (typeof document === "undefined") return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  static logout = () => {
    // Clear cookies
    this.deleteCookie(ACCESS_TOKEN_COOKIE);
    this.deleteCookie(REFRESH_TOKEN_COOKIE);

    // For backward compatibility, also clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    this.isAuthenticated = false;
    this.initialize();
  };

  // Helper method to get a cookie by name
  static getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return undefined;
  }
}
