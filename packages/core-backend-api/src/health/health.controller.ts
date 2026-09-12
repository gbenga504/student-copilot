import { Router } from "express";

export function createHealthController(): Router {
  const router = Router();

  router.get("/", (_request, response) => {
    response.send("OK");
  });

  return router;
}
