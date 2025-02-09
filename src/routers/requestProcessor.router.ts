import caching from "../Request_Processing/caching.middelware";
import ratelimiting from "../Request_Processing/ratelimitng.middelware";
import request_forwarding from "../Request_Processing/requestForwarding";
import request_extractor from "../Request_Processing/requestExtractor.middelware";


import { Request, Response, Router } from "express";

const router = Router();

const temp = async (req: Request, res: Response) => {
    res.status(200).send("Hello, Server is running")
}

router.use(request_extractor)
router.use(caching)
router.use(ratelimiting)
router.use(request_forwarding)

router.get("/", temp)
router.post("/", temp)
router.put("/", temp)
router.delete("/", temp)





export default router;