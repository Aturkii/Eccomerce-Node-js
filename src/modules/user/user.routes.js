import { Router } from "express";
import * as userContoller from "./user.controller.js";
import { validation } from './../../middleware/validationMiddleware.js';
import * as userSchema from './user.validation.js';
import { checkUserExists } from './../../middleware/isExisting.js';
import authMiddleware from "../../middleware/authMiddleware.js";
import authorizeRoles from "../../middleware/auth.roles.js";
import { idSchema } from './../../utils/generalFields.js';
import role from "../../utils/systemRoles.js";

const router = Router()

//? _________________ Sign Up _____________________
router.post(
  '/register',
  checkUserExists('email'),
  validation(userSchema.signUpSchema),
  userContoller.SignUp
);

//? _________________ Verify Email _________________
router.post(
  '/verify-email',
  validation(userSchema.verifyEmailSchema),
  userContoller.verifyEmail
);

//? _________________ Resend OTP ____________________
router.post(
  '/resend-otp',
  validation(userSchema.emailShcema),
  userContoller.resendOTP
);

//? _________________ Sign In ________________________
router.post(
  '/signIn',
  validation(userSchema.signInSchema),
  userContoller.signIn
);

//? _________________ Update User Date ________________
router.put(
  '/UpdateUserData',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(userSchema.updateUserSchema),
  userContoller.updateUserData
);

//? _________________ Update User Email _______________
router.patch(
  '/UpdateUserEmail',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(userSchema.emailShcema),
  userContoller.updateUserEmail
);

//? _________________ Update User Password _____________
router.patch(
  '/passwrod/UpdateUserPassword',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(userSchema.updatePasswordSchema),
  userContoller.updateUserPassword
);

//? _________________ Forget Password ___________________
router.post(
  '/passwrod/forgetPassword',
  validation(userSchema.emailShcema),
  userContoller.forgetPassword
);

//? _________________ Reset Password _____________________
router.post(
  '/passwrod/resetPassword',
  validation(userSchema.resetPasswordSchema),
  userContoller.resetPassword
);

//? _________________ Get Logged User Data ________________
router.get(
  '/user',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator, role.user),
  userContoller.getUserData
);

//? _________________ Get specific User Data ________________
router.post(
  '/specific-user/:id',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(idSchema, 'params'),
  userContoller.getSUserData
);

//? _________________ Get All Users _________________________
router.get(
  '/all/users',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  userContoller.getAllUsers
);

//? _________________ Block User _____________________________
router.get(
  '/blockUser/:id',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(idSchema, 'params'),
  userContoller.blockUser
);

//? _________________ Delete User _____________________________
router.delete(
  '/delete-user/:id?',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  userContoller.deleteUser
);




export default router;