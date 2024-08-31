
import { asyncHandler } from './../../utils/asyncHandler.js';
import User from './../../../db/models/user/user.model.js';
import { AppError } from './../../utils/errorClass.js';
import dotenv from 'dotenv';
import { sendEmail } from './../../service/sendEmail.js';
import { generateOTP } from '../../utils/generateOTP.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Product from './../../../db/models/product/product.mode.js';
import Brand from './../../../db/models/brand/brand.model.js';
import Cart from './../../../db/models/cart/cart.model.js';
import WishList from './../../../db/models/wishList/wishlist.model.js';
import { AdminApplication } from './../../../db/models/admin/admin.model.js';
import Coupon from './../../../db/models/coupon/coupon.model.js';
import Reviews from './../../../db/models/review/review.model.js';
dotenv.config();



//*=========================== Sign Up =====================================  

export const SignUp = asyncHandler(async (req, res, next) => {
  const { firstName,
    lastName,
    email,
    phone,
    age,
    password,
    repassword,
    role,
    addresses,
    gender,
    birthDate,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, +process.env.SALT_ROUND);
  const expminutes = 3
  const { otp, otpExpire } = generateOTP(expminutes);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role,
    otp,
    otpExpire,
    age,
    addresses,
    gender,
    birthDate,
  });

  try {
    const emailSubject = 'Verify Your Email Address';
    const emailHtml = `<h4>Your OTP for email verification is: <b style="background-color: rgb(175, 175, 245);">${otp} </b>
     otp will expire in ${expminutes} minutes. </h4>`;
    await sendEmail(email, emailSubject, emailHtml);
  } catch (error) {
    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully. Please verify your email.',
    user: {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      age: newUser.age,
      role: newUser.role,
      address: newUser.addresses,
      gender: newUser.gender,
      birthDate: newUser.birthDate,
    }
  });
});

//*=========================== Verify =======================================

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { otp, email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailConfirmed) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is already verified'
    });
  }

  if (user.otp !== otp) {
    return next(new AppError('Invalid OTP', 400));
  }

  await User.updateOne(
    { email },
    { $set: { isEmailConfirmed: true, otp: null } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

//*=========================== Re-send OTP ==================================

export const resendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.isEmailConfirmed) {
    return res.status(400).json({
      status: 'fail',
      message: 'Email is already verified'
    });
  }
  const newOTP = generateOTP();

  await User.updateOne(
    { email },
    { $set: { otp: newOTP } }
  );

  const emailSubject = 'Your New OTP Code';
  const emailHtml = `<h4>Your new OTP code for email verification is: <b style="background-color: rgb(175, 175, 245);">${newOTP}</b></h4>`;

  await sendEmail(user.email, emailSubject, emailHtml);

  res.status(200).json({
    status: 'success',
    message: 'New OTP has been sent to your email'
  });
});

//*=========================== Sign In =======================================

export const signIn = asyncHandler(async (req, res, next) => {
  const { emailOrPhone, password } = req.body;

  const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
  const searchCriteria = isEmail ? { email: emailOrPhone } : { phone: emailOrPhone };

  const user = await User.findOne(searchCriteria);

  if (!user) {
    return next(new AppError("Invalid email/phone or password", 401));
  }

  if (!user.isEmailConfirmed) {
    return next(new AppError("Please verify your email to login", 400));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email/phone or password", 401));
  }

  user.online = true;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    status: "success",
    message: "Signed in successfully",
    token
  });
});

//*=========================== Update User Data ===============================

export const updateUserData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { firstName, lastName, phone, age } = req.body;

  const updateFields = {};
  if (firstName) updateFields.firstName = firstName;
  if (lastName) updateFields.lastName = lastName;
  if (phone) updateFields.phone = phone;
  if (age) updateFields.age = age;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: "User updated successfully",
      data: {
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          age: updatedUser.age,
        },
      },
    });
  } catch (error) {
    return next(new AppError('Error updating user data', 500));
  }
});

//*=========================== Update User Email ==============================

export const updateUserEmail = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { email } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return next(new AppError('Email is already in use', 400));
  }

  const otp = generateOTP()

  try {
    const emailSubject = 'Verify Your Email Address';
    const emailHtml = `<h4>Your OTP for the new email verification is: <b style="background-color: rgb(145, 195, 245);">${otp}</b></h4>`;
    await sendEmail(email, emailSubject, emailHtml);
  } catch (error) {
    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        email,
        otp: otp,
        isEmailConfirmed: false,
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Email updated. Please check your new email to verify it.',
  });
});

//*=========================== Update User Password ============================

export const updateUserPassword = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 401));
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  const result = await User.updateOne(
    { _id: userId },
    { $set: { password: hashedNewPassword } }
  );

  if (result.nModified === 0) {
    return next(new AppError('Failed to update password', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});

//*=========================== Forget Password =================================

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with this email address.', 404));
  }

  if (user.otp) {
    return res.status(200).json({
      status: 'success',
      message: 'OTP has already been sent. Please check your inbox.'
    });
  }

  const otp = generateOTP()

  try {
    const emailSubject = 'Reset Your password';
    const emailHtml = `<h4>Your OTP to reset password is: <b style="background-color: rgb(145, 155, 29);">${otp}</b></h4>`;
    await sendEmail(email, emailSubject, emailHtml);
  } catch (error) {
    return next(new AppError('Failed to send OTP. Please try again later.', 500));
  }

  await User.updateOne({ email }, { $set: { otp } });

  res.status(200).json({
    status: 'success',
    message: 'OTP has been sent to your email address. Please check your inbox.'
  });

})

//*=========================== Reset Password ====================================

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmPassword, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with this email address.', 404));
  }

  if (user.otp !== otp) {
    return next(new AppError('Invalid OTP.', 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await User.updateOne(
    { email },
    {
      $set: {
        password: hashedPassword,
        otp: null
      }
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Password has been successfully reset.'
  });
});

//*=========================== Get Logged User Account ============================

export const getUserData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select('-password -otp');

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        age: user.age,
        online: user.online,
      }
    }
  });
});

//*=========================== Get All Users ============================

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password -otp');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

//*=========================== Block User ============================

export const blockUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isBlocked = true;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'User has been blocked successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isBlocked: user.isBlocked
      }
    }
  });
});

//*=========================== Get Specific User ============================

export const getSUserData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-password -otp');

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        age: user.age,
        online: user.online,
      }
    }
  });
});

//*=========================== Delete Specific User ============================

export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id || req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found.', 404));
  }

  await Reviews.findByIdAndDelete({ user: userId });
  await Coupon.findByIdAndDelete({ addedBy: userId })
  await AdminApplication.findByIdAndDelete({ user: userId })
  await WishList.findByIdAndDelete({ user: userId })
  await Cart.findByIdAndDelete({ user: userId })
  await Brand.findByIdAndDelete({ addedBy: userId })
  await Product.findByIdAndDelete({ addedBy: userId })

  await User.findByIdAndDelete(userId);

  res.status(204).json({
    status: 'success',
    message: `User with ID ${userId} has been deleted successfully.`,
  });
});