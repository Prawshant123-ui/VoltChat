const express = require("express");

const { registerUser, loginUser } = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
} = require("../validators/authValidators");

const validateRequest = require("../middleware/validateRequest");

const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

const authLimiter = rateLimiter(10, 60);

router.post(
  "/register",
  authLimiter,
  registerValidation,
  validateRequest,
  registerUser,
);

router.post("/login", authLimiter, loginValidation, validateRequest, loginUser);

module.exports = router;
