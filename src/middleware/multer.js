import multer from "multer";
import { AppError } from "../utils/errorClass.js";


export const validFiles = {
    image: ["image/png", "image/jpg", "image/jpeg","image/avif"],
    document: ["application/pdf"],
    zip: ["application/zip", "application/x-zip-compressed"],
};


export const multerHost = (customValidation) => {

    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (!customValidation.includes(file.mimetype)) {
            return cb(new AppError("file is not supported"), false)
        }
        return cb(null, true)
    }

    return multer({ storage, fileFilter })
}