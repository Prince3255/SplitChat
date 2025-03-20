// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)


// const storage = multer.diskStorage({
//     destination: function (req, file, cb ) {
//         const uploadPath = path.resolve(__dirname, '../public/temp')
//         if(!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true})
//         }
//         console.log("file", file)
//         // console.log("req file", req)
//         cb(null, uploadPath)
//     },
//     filename: function (req, file, cb ) {
//         const unsuffix = new Date().getTime() + Math.random().toString(36).substring(2, 15);
//         cb(null, file.originalname + '-' + unsuffix);
//     }
// })

// export const upload = multer({ storage: storage })

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload destination
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, '../public/temp');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
        console.log("file", file)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Use `upload.fields()` to handle multiple file types
export const upload = multer({
    storage: storage
});