import jwt from "jsonwebtoken";
import Student from "../models/studentModal.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { promisify } from "util";

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  //Remove password from the output

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

export const signin = catchAsync(async (req, res, next) => {
  const newStudent = await Student.create(req.body);

  createSendToken(newStudent, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError("Please provide email or password!", 400));
  }

  const student = await Student.findOne({ email }).select("+password");

  if (
    !student ||
    !(await student.correctPassword(password, student.password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(student, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  //1) Check if there is a token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You must be logged in to access this route", 400)
    );
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const currentUser = await Student.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  //GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
});
