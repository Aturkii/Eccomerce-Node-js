import User from "../../db/models/user/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errorClass.js";


//? Is User already existing middleware 
export const checkUserExists = (field) =>
  asyncHandler(async (req, res, next) => {
    try {
      const findWith = {};
      findWith[field] = req.body[field];
      const user = await User.findOne(findWith);
      if (user) {
        return next(new AppError('User already exists', 409));
      }
      next();
    } catch (error) {
      next(error);
    }
  })