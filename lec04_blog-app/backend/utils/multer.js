const multer = require("multer");
const path = require("path");

// storage
const storage = multer.memoryStorage();

// upload
const upload = multer({
        storage: storage
    }

)

// export upload
module.exports = upload;