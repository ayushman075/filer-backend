import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteData, getAnalytics, getData, getDataById, updateData, uploadXML } from "../controllers/file.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const fileRouter = Router();

fileRouter.route("/getAll").get(
    verifyJWT,
    getData
);
fileRouter.route("/getById/:id").get(
    verifyJWT,
  getDataById
);

fileRouter.route("/upload/xml").post(
  verifyJWT,
  upload.single('dataFile'),
  uploadXML
)

fileRouter.put("/update/:id",verifyJWT, updateData);
fileRouter.delete("/delete/:id",verifyJWT, deleteData);
fileRouter.get("/getAnalytics",verifyJWT, getAnalytics);

export {fileRouter}