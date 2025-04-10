import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import helloRouter from "./routes/helloRoute.js";
import authRouter from "./routes/auth.js";
import productRouter from "./routes/product.js";
import deviceRouter from "./routes/device.js";
import { SocketService } from "./services/socketService.js";

export let io: SocketService;

dotenv.config();
connectDB()
  .then(() => {
    const app: Express = express();
    const httpServer = createServer(app);
    io = new SocketService(httpServer);
    const PORT = process.env.PORT || 5000;

    // middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

const app: Express = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

    app.use(helloRouter);
    app.use("/auth", authRouter);
    app.use("/products", productRouter);
    app.use("/devices", deviceRouter);

    httpServer.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
