import express from "express";
import {
  login,
  logout,
  protect,
  signin,
} from "../controllers/authController.js";
import { getAllStudents, updateMe } from "../controllers/studentController.js";

const router = express.Router();

router.route("/signin").post(signin);

router.route("/login").post(login);
router.route("/updateMe").patch(protect, updateMe);
router.route("/logout").get(logout);
router.route("/getAllStudents").get(getAllStudents);

export default router;
