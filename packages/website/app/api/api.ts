import axios from "axios";

import { publicRuntimeConfig } from "~/libs/configuration/public-runtime-config";

import { AuthResource } from "./auth";
import { NotesResource } from "./notes";

type CreateApiClientOptions = {
  apiUrl: string;
  accessToken?: string;
  timeout?: number;
};

export function createApiClient(options: CreateApiClientOptions) {
  const httpClient = axios.create({
    baseURL: options.apiUrl,
    timeout: options.timeout,
    withCredentials: true,
  });

  if (options.accessToken) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${options.accessToken}`;
  }

  return {
    auth: new AuthResource(httpClient),
    notes: new NotesResource(httpClient),
  };
}

export function getBrowserApiClient() {
  return createApiClient({
    apiUrl: publicRuntimeConfig.API_PROXY,
    timeout: Number(publicRuntimeConfig.API_TIMEOUT_MS),
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
