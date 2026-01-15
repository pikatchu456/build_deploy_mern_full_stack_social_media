import multer from "multer";

const storage = multer.memoryStorage(); // Stockage en mémoire vive
export const upload = multer({ storage });