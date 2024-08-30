import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorClass.js';
import User from './../../db/models/user/user.model.js';



//& Authentcation middleware 
const authMiddleware = () => {
  return async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
      return next(new AppError("token is required", 401));
    }

    if (!token.startsWith(process.env.TOKEN_PREFIX)) {
      return next(new AppError("Invalid token format", 400));
    }

    const realToken = token.split(process.env.TOKEN_PREFIX)[1];

    try {
      const decoded = jwt.verify(realToken, process.env.JWT_SECRET);

      if (!decoded?.id) {
        return next(new AppError("Invalid token", 400));
      }

      const user = await User.findOne({ _id: decoded.id });

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new AppError("Token is invalid or expired", 401));
    }
  }
}

export default authMiddleware;
