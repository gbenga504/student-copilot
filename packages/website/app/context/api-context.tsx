import { createContext, type ReactNode, useContext } from "react";

import type { ApiClient } from "~/api/api";

const ApiContext = createContext<ApiClient | null>(null);

type ApiProviderProps = {
  api: ApiClient;
  children: ReactNode;
};

export function ApiProvider({ api, children }: ApiProviderProps) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClient {
  const api = useContext(ApiContext);

  if (!api) {
    throw new Error("useApi must be used within an ApiProvider");
  }

  return api;
}
