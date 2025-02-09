import { getRequestLogByrequestId, getRequestLogByUserId } from "../controllers/requestLog.controller"
import { Router } from "express";
import auth from "../middelwares/auth.middelware";

const router = Router();

router.post("/getrequestlogbyrequestid", auth, getRequestLogByrequestId);
router.post("/getrequestlogbyuserid", auth, getRequestLogByUserId);


export default router;
