import catchAsync from "../utils/catchAsync.js";
import Student from "../models/studentModal.js";
import APIFeatures from "../utils/apiFeatures.js";

export const updateMe = catchAsync(async (req, res, next) => {
  const updatedStudent = await Student.findByIdAndUpdate(
    { _id: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedStudent,
    },
  });
});

export const getAllStudents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Student.find({}), req.query).filter().sort();

  const students = await features.query;
  res.status(200).json({
    status: "success",
    data: {
      students,
    },
  });
});
