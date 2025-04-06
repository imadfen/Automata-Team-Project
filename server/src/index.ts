import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import helloRouter from "./routes/helloRoute.js";

dotenv.config();
connectDB()
  .then(() => {
    const app: Express = express();
    const PORT = process.env.PORT || 5000;
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.get("/", (req: Request, res: Response) => {
      res.send("server is running");
    });

    app.use(helloRouter);

    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
