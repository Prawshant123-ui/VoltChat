const express = require("express");

const upload = require("../utils/multer");

const { uploadImage, uploadVideo } = require("../controllers/uploadController");

const router = express.Router();


router.post("/image", upload.single("file"), uploadImage);


router.post("/video", upload.single("file"), uploadVideo);

module.exports = router;
