import multer from "multer"

// Set storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp'); // folder to save the file
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname);
  }
});

export const upload = multer({ storage });