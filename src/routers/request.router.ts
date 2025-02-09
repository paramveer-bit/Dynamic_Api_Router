import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { addNewRequest, getAllRequests, deleteRequest, findRequestById, modifyCacheTime, modifyDefaultRateLimit, toggelRateLimiting, toggelCaching, AddBanUser, RemoveBanUser, getListOfBannedUsers } from "../controllers/request.controller";

const router = Router();


router.post("/addnewrequest", auth, addNewRequest);
router.get("/getallrequests", auth, getAllRequests);
router.delete("/deleterequest", auth, deleteRequest);

router.get("/findrequestbyid", auth, findRequestById);

router.post("/modifycachetime", auth, modifyCacheTime);
router.post("/toggelcaching", auth, toggelCaching);

router.post("/toggelratelimiting", auth, toggelRateLimiting);
router.post("/modifydefaultratelimit", auth, modifyDefaultRateLimit);

router.post("/addbanuser", auth, AddBanUser);
router.post("/removebanuser", auth, RemoveBanUser);
router.get("/getlistofbannedusers", auth, getListOfBannedUsers);

export default router;




