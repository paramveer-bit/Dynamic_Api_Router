import { Router } from "express";
import auth from "../middelwares/auth.middelware";
import { addNewRequest, getAllRequests, update_request, deleteRequest, findRequestById, modifyCacheTime, modifyDefaultRateLimit, toggelRateLimiting, toggelCaching, AddBanUser, RemoveBanUser, getListOfBannedUsers } from "../controllers/request.controller";

const router = Router();


router.post("/addnew", auth, addNewRequest);
router.get("/getall", auth, getAllRequests);
router.delete("/delete/:id", auth, deleteRequest);
router.get("/get/:id", auth, findRequestById);
router.put("/update/:id", auth, update_request);

router.post("/modifycachetime/:id", auth, modifyCacheTime);
router.get("/toggelcaching/:id", auth, toggelCaching);

router.get("/toggelratelimiting/:id", auth, toggelRateLimiting);
router.post("/modifyratelimit/:id", auth, modifyDefaultRateLimit);

router.post("/addbanuser/:id", auth, AddBanUser);
router.post("/removebanuser/:id", auth, RemoveBanUser);
router.get("/getlistofbannedusers/:id", auth, getListOfBannedUsers);

export default router;




