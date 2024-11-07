import { ResponseBuilder, Sqlite, Router } from "@fermyon/spin-sdk";
import { getAll, getSubsetByDay, getSubsetByRelativeTime } from "./handlers";

const router = Router();

router.get("/api/", ({ }, _req, res) => getAll(res));
router.get("/api/today", ({ }, _req, res) => getSubsetByDay("today", res))
router.get("/api/yesterday", ({ }, _req, res) => getSubsetByDay("yesterday", res))
router.get("/api/since/:time", ({ params }, _req, res) => getSubsetByRelativeTime(params.time, res))

export async function handler(req: Request, res: ResponseBuilder) {
  return await router.handleRequest(req, res, {});
}