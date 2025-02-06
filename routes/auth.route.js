import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(
    registerUser
);
authRouter.route("/login").post(
  loginUser
);

authRouter.route("/logout").post(
  verifyJWT,
  logoutUser
)

authRouter.route("/getcurrentuser").get(verifyJWT,getCurrentUser)

export {authRouter}