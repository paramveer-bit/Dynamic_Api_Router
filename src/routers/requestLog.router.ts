import { getRequestLogByrequestId, allData, DataByDays, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours } from "../controllers/requestLog.controller"
import { Router } from "express";
import auth from "../middelwares/auth.middelware";

const router = Router();

router.post("/getrequestlogbyrequestid", auth, getRequestLogByrequestId);
router.post("/getrequestlogbyuserid", auth, getRequestLogByUserId);
router.get("/thisMonthRequests", auth, getAllRequestsThisMonthByClientId);
router.get("/last24Hours", auth, last24Hours);
router.get("/allData", auth, allData);
router.post("/DataByDays", auth, DataByDays)


export default router;
