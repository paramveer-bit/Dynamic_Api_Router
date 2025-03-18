import { ApiEndPointsUtilization, routeSpecificData, userLast5Min, userActivityData, deviceDetails, userApiEndpoints, userDetailsByDays, last5Min, statusCodes, EndPointsResponseTime, getRequestLogByrequestId, apiUsageChart, allData, DataByDays, getRequestLogByUserId, getAllRequestsThisMonthByClientId, last24Hours } from "../controllers/requestLog.controller"
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
router.get("/last5Min", auth, last5Min)
router.get("/userDetailsByDays", auth, userDetailsByDays)
router.get("/userApiEndpoints", auth, userApiEndpoints)
router.get("/deviceDetails", auth, deviceDetails)
router.get("/userActivityData", auth, userActivityData)
router.get("/userLast5Min", auth, userLast5Min)
router.get("/routeSpecificData", auth, routeSpecificData)



export default router;
