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

// Cookie settings
const getCookieSettings = () => {
  const isSecure = window.location.protocol === "https:";
  // Use SameSite=None for cross-site requests in secure contexts
  // Use SameSite=Lax for same-site navigation in insecure contexts
  const sameSite = isSecure ? "None" : "Lax";
  // Secure attribute must be used with SameSite=None
  const secure = isSecure ? "; Secure" : "";

  return {
    accessToken: `path=/; max-age=3600; SameSite=${sameSite}${secure}`,
    refreshToken: `path=/; max-age=86400; SameSite=${sameSite}${secure}`,
  };
};

export class BackendAPI {
  static shiftApi: ShiftApi;
  static companyApi: CompanyApi;
  static authApi: AuthApi;
  static isAuthenticated: boolean = false;

  static initialize = (token?: string) => {
    // Try to get token from cookies if not provided
    if (!token && typeof window !== "undefined") {
      // Try cookie first
      token = this.getCookie(ACCESS_TOKEN_COOKIE) || undefined;

      // If no cookie token but memory token exists, use that
      if (!token && this._memoryToken) {
        console.log("Using memory token for initialization");
        token = this._memoryToken;
      }
    }

    // Skip re-initialization if we already have the same token
    if (token && this.isAuthenticated && this.shiftApi) {
      return this.isAuthenticated;
    }

    const config = new Configuration({
      basePath: API_BASE_URL,
      baseOptions: {
        withCredentials: true, // Enables sending cookies with requests
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
          const cookieSettings = getCookieSettings();

          // Set access token cookie
          document.cookie = `${ACCESS_TOKEN_COOKIE}=${result.data.accessToken}; ${cookieSettings.accessToken}`;

          // Set refresh token cookie if available
          if (result.data.refreshToken) {
            document.cookie = `${REFRESH_TOKEN_COOKIE}=${result.data.refreshToken}; ${cookieSettings.refreshToken}`;
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

        // Store tokens in memory and localStorage as fallback
        this._memoryToken = result.data.accessToken;
        this._memoryRefreshToken = result.data.refreshToken || null;
        this.saveTokensToStorage(
          result.data.accessToken,
          result.data.refreshToken
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

  // Memory fallback for environments where cookies don't work
  static _memoryToken: string | null = null;
  static _memoryRefreshToken: string | null = null;

  // Add storage persistence for refresh resilience
  static saveTokensToStorage(accessToken: string, refreshToken?: string) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("qs_access_token", accessToken);
        if (refreshToken) {
          window.localStorage.setItem("qs_refresh_token", refreshToken);
        }
      }
    } catch (e) {
      console.warn("Failed to save tokens to localStorage", e);
    }
  }

  static loadTokensFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const accessToken = window.localStorage.getItem("qs_access_token");
        const refreshToken = window.localStorage.getItem("qs_refresh_token");

        if (accessToken) {
          this._memoryToken = accessToken;
          if (refreshToken) {
            this._memoryRefreshToken = refreshToken;
          }
          return true;
        }
      }
    } catch (e) {
      console.warn("Failed to load tokens from localStorage", e);
    }
    return false;
  }

  static clearTokensFromStorage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("qs_access_token");
        window.localStorage.removeItem("qs_refresh_token");
      }
    } catch (e) {
      console.warn("Failed to clear tokens from localStorage", e);
    }
  }

  static async refresh() {
    if (typeof window === "undefined") {
      throw new Error("Cannot refresh token outside of browser context");
    }

    let currentToken = this.getCookie(ACCESS_TOKEN_COOKIE);
    let refreshToken = this.getCookie(REFRESH_TOKEN_COOKIE);

    // Try memory fallback if cookies aren't available
    if (!currentToken && this._memoryToken) {
      currentToken = this._memoryToken;
    }

    if (!refreshToken && this._memoryRefreshToken) {
      refreshToken = this._memoryRefreshToken;
    }

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
          const cookieSettings = getCookieSettings();

          // Set access token cookie
          document.cookie = `${ACCESS_TOKEN_COOKIE}=${result.data.accessToken}; ${cookieSettings.accessToken}`;

          // Set refresh token cookie if available
          if (result.data.refreshToken) {
            document.cookie = `${REFRESH_TOKEN_COOKIE}=${result.data.refreshToken}; ${cookieSettings.refreshToken}`;
          }
        }

        // Update memory tokens as fallback
        this._memoryToken = result.data.accessToken;
        if (result.data.refreshToken) {
          this._memoryRefreshToken = result.data.refreshToken;
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
    // Try to load tokens from storage if they're not already in memory
    if (!this._memoryToken) {
      this.loadTokensFromStorage();
    }

    // Check if we have cookies
    const hasAccessTokenCookie = !!this.getCookie(ACCESS_TOKEN_COOKIE);
    const hasRefreshTokenCookie = !!this.getCookie(REFRESH_TOKEN_COOKIE);

    // Check memory fallback if available
    const hasMemoryToken = !!this._memoryToken;
    const hasMemoryRefresh = !!this._memoryRefreshToken;

    console.log(
      "Auth check - Access Token Cookie:",
      hasAccessTokenCookie,
      "Refresh Token Cookie:",
      hasRefreshTokenCookie,
      "Memory tokens:",
      hasMemoryToken
    );

    // If we have both cookies or memory tokens, we're authenticated
    if (
      (hasAccessTokenCookie && hasRefreshTokenCookie) ||
      (hasMemoryToken && hasMemoryRefresh)
    ) {
      console.log("Auth tokens present, user is authenticated");
      this.isAuthenticated = true;
      if (hasAccessTokenCookie) {
        this.initialize(this.getCookie(ACCESS_TOKEN_COOKIE) || undefined);
      } else if (hasMemoryToken && this._memoryToken) {
        this.initialize(this._memoryToken);
      }

      // If we have a memory token but no cookie, try re-setting the cookie
      if (
        hasMemoryToken &&
        !hasAccessTokenCookie &&
        typeof document !== "undefined"
      ) {
        console.log("Restoring cookies from memory tokens");
        const cookieSettings = getCookieSettings();
        document.cookie = `${ACCESS_TOKEN_COOKIE}=${this._memoryToken}; ${cookieSettings.accessToken}`;
        if (this._memoryRefreshToken) {
          document.cookie = `${REFRESH_TOKEN_COOKIE}=${this._memoryRefreshToken}; ${cookieSettings.refreshToken}`;
        }
      }

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

    // If we don't have both cookies or memory tokens, we're not authenticated
    console.log("Missing auth tokens, user is not authenticated");
    this.isAuthenticated = false;
    return false;
  }

  static updateAuthToken = (token: string) => {
    this.initialize(token);

    // Also update memory token
    this._memoryToken = token;
  };

  // Helper method to delete a cookie
  static deleteCookie(name: string) {
    if (typeof document === "undefined") return;

    // Use the same path as when we set the cookie
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  static logout = () => {
    // Clear cookies
    this.deleteCookie(ACCESS_TOKEN_COOKIE);
    this.deleteCookie(REFRESH_TOKEN_COOKIE);

    // Clear memory tokens
    this._memoryToken = null;
    this._memoryRefreshToken = null;

    // Clear localStorage
    this.clearTokensFromStorage();

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
