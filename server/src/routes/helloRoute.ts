import express from "express";
import helloController from "../controllers/helloController.js";

const router = express.Router();

router.get("/hello", helloController);

export default router;
