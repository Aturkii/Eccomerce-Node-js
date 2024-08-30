import Coupon from "../../../db/models/coupon/coupon.model.js"
import { AppError } from './../../utils/errorClass.js';
import { asyncHandler } from './../../utils/asyncHandler.js';

//* ============================= Create Coupon ================================

export const addCoupon = asyncHandler(async (req, res, next) => {
  const { code, amount, startDate, endDate } = req.body;

  const couponExist = await Coupon.findOne({ code: code.toLowerCase() });
  if (couponExist) {
    return next(new AppError('Coupon already exists', 400));
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError('Start date must be before end date', 400));
  }

  const coupon = await Coupon.create({
    code: code.toLowerCase(),
    amount,
    startDate,
    endDate,
    addedBy: req.user._id
  });

  req.data = {
    model: Coupon,
    id: coupon._id
  };

  res.status(201).json({
    status: 'success',
    message: 'Coupon created successfully', coupon
  });
});

//* ============================= Update Coupon ================================

export const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { code, amount, startDate, endDate } = req.body;

  const couponExist = await Coupon.findById(id);
  if (!couponExist) {
    return next(new AppError('Coupon not found', 404));
  }

  const updateFields = {};
  if (code) {
    const codeExist = await Coupon.findOne({ code: code.toLowerCase() });
    if (codeExist && codeExist._id.toString() !== id) {
      return next(new AppError('Coupon code already exists', 400));
    }
    updateFields.code = code.toLowerCase();
  }
  if (amount !== undefined) {
    updateFields.amount = amount;
  }
  if (startDate) {
    updateFields.startDate = new Date(startDate);
  }
  if (endDate) {
    updateFields.endDate = new Date(endDate);
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: 'Coupon updated successfully',
    coupon: updatedCoupon
  });
});

//* ============================= Delete Coupon ================================

export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  await Coupon.findByIdAndDelete(id);

  res.status(200).json({
    status: 'success',
    message: 'Coupon deleted successfully'
  });
});

//* ============================= Get all Coupons ===============================

export const getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().populate({
    path: 'addedBy',
    select: 'firstName lastName -_id'
  })
  return res.status(200).json({
    status: 'success',
    message: 'Coupons fetched successfully',
    coupons
  })
})

//* ============================= Get Specific Coupon =============================

export const getCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params

  const couponExist = await Coupon.findById(id).populate({
    path: 'addedBy',
    select: 'firstName lastName -_id'
  })

  if (!couponExist) {
    return next(new AppError('Coupon not found', 404))
  }

  return res.status(200).json({
    status: 'success',
    message: 'Coupon fetched successfully', couponExist
  })
})