import express from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", getCurrentUserController);

export default router;
