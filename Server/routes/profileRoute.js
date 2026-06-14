const express = require("express");
const router = express.Router();
const visitProfile = require("../controllers/profileController");
const protect = require("../middleware/authMiddleware");

router.get("/profile/:id", protect, visitProfile);

module.exports = router;
