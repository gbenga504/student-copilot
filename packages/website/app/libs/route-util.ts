import { generatePath } from "react-router";

export const ROUTE_IDS = {
  dashboardHomePage: "dashboardHomePage",
} as const;

type Route = {
  id: keyof typeof ROUTE_IDS;
  path: string;
};

const routes: Route[] = [
  { id: ROUTE_IDS.dashboardHomePage, path: "/dashboard" },
];

const getPath = ({
  routes,
  routeId,
}: {
  routes: Route[];
  routeId: string;
}): string | undefined => {
  if (routes.length === 0) return undefined;

  const [firstRoute, ...restRoutes] = routes;

  if (firstRoute.id === routeId) {
    return firstRoute.path;
  }

  return getPath({ routes: restRoutes, routeId });
};

export const constructURL = ({
  routeId,
  query,
  params,
}: {
  routeId: keyof typeof ROUTE_IDS;
  query?: { [key: string]: string | undefined | null };
  params?: { [key: string]: string | undefined };
}): string => {
  if (!params?.lang) {
    throw new Error("You must pass the lang params");
  }

  let path = getPath({ routes, routeId });

  if (!path) {
    throw new Error(`Cannot find path with routeId ==> ${routeId}`);
  }

  path = generatePath(path, params);

  if (query) {
    const searchParams = new URLSearchParams();

    Object.keys(query).forEach((key) => {
      if (query[key]) {
        searchParams.append(key, query[key]!);
      }
    });

    path += `?${searchParams.toString()}`;
  }

  return path;
};
