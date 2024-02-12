import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords do not match",
      },
    },
    dateOfGrad: Date,
    github: String,
    website: String,
    location: String,
    bio: {
      type: String,
      default: "",
    },
    profilePic: String,
    fieldOfInterest: String,
    seeking: [String],
    techStack: [String],
  },
  {
    timestamps: true,
  }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

studentSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
