import { Router } from "express";
import { signup, getApiKey, signIn, resendOtp, verifyUser, signOut, isSignedIn, resetPasswordWhileLoggin } from "../controllers/user.controller";
import auth from "../middelwares/auth.middelware";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signIn);
router.post("/verify", verifyUser);
router.post("/resendotp", resendOtp);
router.post("/signout", auth, signOut);
router.get("/issignedin", auth, isSignedIn);
router.post("/resetpassword", auth, resetPasswordWhileLoggin);
router.get("/getApiKey", auth, getApiKey);



export default router;


