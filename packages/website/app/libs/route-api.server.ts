import {
  type ActionFunctionArgs,
  data,
  type LoaderFunctionArgs,
} from "react-router";

import type { ApiClient } from "~/api/api";
import { getServerApiClient } from "~/api/api.server";
import { ApiError } from "~/errors/api-error";
import {
  type ServerRuntimeConfig,
  serverRuntimeConfig,
} from "~/libs/configuration/server-runtime-config.server";

export type ServerRouteContext = {
  api: ApiClient;
  serverConfig: ServerRuntimeConfig;
};

export type ApiErrorData = {
  error: string;
  code: string;
  fields?: Record<string, string[]>;
  data?: unknown;
};

export function loaderWithServerContext<
  Args extends LoaderFunctionArgs,
  Result,
>(
  loader: (args: Args & ServerRouteContext) => Result | Promise<Result>
): (args: Args) => Promise<Result> {
  return async (args) => {
    const api = await getServerApiClient(args.request, serverRuntimeConfig);

    try {
      return await loader({ ...args, api, serverConfig: serverRuntimeConfig });
    } catch (error) {
      if (error instanceof ApiError) {
        throw apiErrorToDataResponse(error);
      }

      throw error;
    }
  };
}

export function actionWithServerContext<
  Args extends ActionFunctionArgs,
  Result,
>(action: (args: Args & ServerRouteContext) => Result | Promise<Result>) {
  return async (args: Args) => {
    const api = await getServerApiClient(args.request, serverRuntimeConfig);

    try {
      return await action({ ...args, api, serverConfig: serverRuntimeConfig });
    } catch (error) {
      if (error instanceof ApiError) {
        return apiErrorToDataResponse(error);
      }

      throw error;
    }
  };
}

export function apiErrorToDataResponse(error: ApiError) {
  return data<ApiErrorData>(
    {
      error: error.message,
      code: error.code,
      fields: error.fields,
      data: error.data,
    },
    { status: error.statusCode }
  );
}
