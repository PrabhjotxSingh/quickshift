import { STATUS_CODES } from "http";
import {
  ShiftApi,
  CompanyApi,
  AuthApi,
  Configuration,
  LoginRequest,
} from "../backend-api";

const API_BASE_URL = "http://localhost:3000";

export class BackendAPI {
  static shiftApi: ShiftApi;
  static companyApi: CompanyApi;
  static authApi: AuthApi;

  static initialize = (token?: string) => {
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
      this.updateAuthToken(result.data.accessToken);
    } else {
      throw new Error("Invalid login");
    }
  }

  static updateAuthToken = (token: string) => {
    this.initialize(token);
  };
}
