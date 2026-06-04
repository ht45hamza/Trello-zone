import multer from "multer";
import path from "path";
import fs from "fs";

const getDestination = () => {
    if (process.env.VERCEL) {
        return "/tmp";
    }
    const localTemp = "./public/temp";
    if (!fs.existsSync(localTemp)) {
        fs.mkdirSync(localTemp, { recursive: true });
    }
    return localTemp;
};

const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, getDestination());
    },
    filename: function (req: any, file: any, cb: any) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ 
    storage,
});
