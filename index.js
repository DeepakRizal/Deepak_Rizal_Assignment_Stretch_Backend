import express from "express";
import dotenv from "dotenv";
import studentRouter from "./routes/studentRoute.js";
import mongoose from "mongoose";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";
import cors from "cors";

const app = express();
dotenv.config({ path: ".env" });

app.use(express.json());
app.use(cors());

app.use("/api/v1/students", studentRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("connected to db!");
  app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
  });
});
