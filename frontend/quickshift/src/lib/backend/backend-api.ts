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
    : "https://11976zm8eb.execute-api.us-east-2.amazonaws.com/dev";

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

    // Skip re-initialization if we already have the same token
    if (token && this.isAuthenticated && this.shiftApi) {
      return this.isAuthenticated;
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

    // Always create the API clients
    this.shiftApi = new ShiftApi(config);
    this.companyApi = new CompanyApi(config);
    this.authApi = new AuthApi(config);

    // Update authentication state
    this.isAuthenticated = !!token;

    return this.isAuthenticated;
  };

  static async login(loginRequest: LoginRequest) {
    try {
      // Ensure API clients are initialized
      if (!this.authApi) {
        this.initialize();
      }

      console.log("Attempting login...");
      const result = await this.authApi.login(loginRequest);
      console.log("Login response:", result);

      if (result.status === 200 && result.data.accessToken != null) {
        // The backend should set the cookies via setTokenResponse
        // But let's manually set them as a fallback
        console.log("Login successful, setting authentication state");
        this.isAuthenticated = true;

        // Manually set cookies if they're not being set by the backend
        if (typeof document !== "undefined") {
          // Set access token cookie
          document.cookie = `${ACCESS_TOKEN_COOKIE}=${result.data.accessToken}; path=/; max-age=3600; SameSite=Lax`;

          // Set refresh token cookie if available
          if (result.data.refreshToken) {
            document.cookie = `${REFRESH_TOKEN_COOKIE}=${result.data.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
          }
        }

        // Initialize with the new token directly
        this.initialize(result.data.accessToken);

        // Verify cookies were set
        const hasAccessTokenCookie = !!this.getCookie(ACCESS_TOKEN_COOKIE);
        const hasRefreshTokenCookie = !!this.getCookie(REFRESH_TOKEN_COOKIE);
        console.log(
          "After login - Access Token Cookie:",
          hasAccessTokenCookie,
          "Refresh Token Cookie:",
          hasRefreshTokenCookie
        );

        return true;
      } else {
        console.log("Login failed - invalid response");
        this.isAuthenticated = false;
        throw new Error("Invalid login");
      }
    } catch (error) {
      console.error("Login error:", error);
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
        // The backend should set the cookies via setTokenResponse
        // But let's manually set them as a fallback
        this.isAuthenticated = true;

        // Manually set cookies if they're not being set by the backend
        if (typeof document !== "undefined") {
          // Set access token cookie
          document.cookie = `${ACCESS_TOKEN_COOKIE}=${result.data.accessToken}; path=/; max-age=3600; SameSite=Lax`;

          // Set refresh token cookie if available
          if (result.data.refreshToken) {
            document.cookie = `${REFRESH_TOKEN_COOKIE}=${result.data.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
          }
        }

        // Initialize with the new token directly
        this.initialize(result.data.accessToken);
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
    // Check if we have cookies
    const hasAccessTokenCookie = !!this.getCookie(ACCESS_TOKEN_COOKIE);
    const hasRefreshTokenCookie = !!this.getCookie(REFRESH_TOKEN_COOKIE);

    console.log(
      "Cookie check - Access Token:",
      hasAccessTokenCookie,
      "Refresh Token:",
      hasRefreshTokenCookie
    );

    // If we have both cookies, we're authenticated
    if (hasAccessTokenCookie && hasRefreshTokenCookie) {
      console.log("Both cookies present, user is authenticated");
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

    // If we don't have both cookies, we're not authenticated
    console.log("Missing cookies, user is not authenticated");
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
