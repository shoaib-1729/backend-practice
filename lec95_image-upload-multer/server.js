const express = require("express")
const path = require("node:path")
    // multer
const multer = require("multer");
// uploading destination
// const upload = multer({ dest: 'uploads/' })

// server
const app = express();

// middleware
app.use(express.json());
// url encoded
app.use(express.urlencoded({ extended: true }));

// multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Use relative path for uploads folder
        cb(null, path.join(__dirname, "uploads/"));
    },
    filename: function(req, file, cb) {
        // 1. error 2. filename
        const uploadFilename = Date.now() + path.extname(file.originalname);
        cb(null, uploadFilename);
    }
});

// upload
// const upload = multer({
//     storage:storage,
//     limits: {
// Set the file size limit to 100,000 bytes (100 KB)
//         fileSize: 100000
//     }
// });

// server

// multer setup with file size limit
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000 // Limit file size to 100 KB (100,000 bytes)
    }
}).single('image'); // Only single file upload

// route
// error handling multer
app.post('/imageUpload', function(req, res) {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(200).json({
                "success": false,
                "message": "File size is more than 100 KB limit",
                "error": err.message,
            })
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(200).json({
                "success": false,
                "message": "Error uploading image",
                "error": err.message,
            })
        }
        // validations
        if (!req.file) {
            return res.status(400).json({
                "success": false,
                "message": "Please upload the file"
            })
        }

        // Everything went fine.
        return res.status(200).json({
            "success": true,
            "message": "Image uploaded successfully...",
            // file details
            "file": req.file

        })
    })
})


// without multer error handling
// app.post(
//     "/imageUpload",
//     upload.single("image"),
//     (req, res) => {
//         try {
// validations
//             if (!req.file) {
//                 res.status(400).json({
//                     "success": false,
//                     "message": "Please upload the file"
//                 })
//             }
//             res.status(200).json({
//                 "success": true,
//                 "message": "Image uploaded successfully...",
// file details
//                "file": req.file

//             })

//         } catch (err) {
//             res.status(500).json({
//                 "success": false,
//                 "message": "Error uploading image",
//                 "error": err.message

//             })
//         }
//     });

// listen to server

app.listen(3000, function() {
    console.log("Server is listening on port 3000")
});