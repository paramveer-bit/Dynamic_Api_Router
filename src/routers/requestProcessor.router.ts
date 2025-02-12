import caching from "../Request_Processing/caching.middelware";
import ratelimiting from "../Request_Processing/ratelimitng.middelware";
import request_forwarding from "../Request_Processing/requestForwarding";
import request_extractor from "../Request_Processing/requestExtractor.middelware";


import { Request, Response, Router } from "express";

const router = Router();



router.use(request_extractor)
router.use(ratelimiting)
router.use(caching)

router.get("/*", request_forwarding)
router.post("/*", request_forwarding)
router.put("/*", request_forwarding)
router.delete("/*", request_forwarding)





export default router;