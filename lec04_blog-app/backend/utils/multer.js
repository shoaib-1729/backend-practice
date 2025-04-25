const multer = require("multer");
const path = require("path");

// storage
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }

})

// upload
const upload = multer({
        storage: storage
    }

)

// export upload
module.exports = upload;