import { ApiEndPointsUtilization, statusCodes, EndPointsResponseTime, getRequestLogByrequestId, apiUsageChart, allData, DataByDays, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours } from "../controllers/requestLog.controller"
import { Router } from "express";
import auth from "../middelwares/auth.middelware";

const router = Router();

router.post("/getrequestlogbyrequestid", auth, getRequestLogByrequestId);
router.post("/getrequestlogbyuserid", auth, getRequestLogByUserId);
router.get("/thisMonthRequests", auth, getAllRequestsThisMonthByClientId);
router.get("/last24Hours", auth, last24Hours);
router.get("/allData", auth, allData);
router.get("/databydays", auth, DataByDays)
router.get("/apiUsageChart", auth, apiUsageChart)
router.get("/end-point-utilization", auth, ApiEndPointsUtilization)
router.get("/end-point-response-time", auth, EndPointsResponseTime)
router.get("/status-codes", auth, statusCodes)


export default router;
