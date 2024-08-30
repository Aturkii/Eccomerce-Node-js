
import Reviews from '../../../db/models/review/review.model.js';
import Product from './../../../db/models/product/product.mode.js';
import { asyncHandler } from './../../utils/asyncHandler';
import { AppError } from './../../utils/errorClass.js';
import Order from './../../../db/models/order/order.model.js';
import { apiFeatures } from './../../utils/apiFeatures.js';


//* ============================== Add Review ========================================

export const addReview = asyncHandler(async (req, res, next) => {
  const { comment, rate } = req.body;
  const { productId } = req.params;

  if (rate < 1 || rate > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const existingReview = await Reviews.findOne({ user: req.user.id, product: productId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this product', 400));
  }

  const order = await Order.findOne({
    user: req.user.id,
    "products.productId": productId,
    isDelivered: true
  });
  if (!order) {
    return next(new AppError('You must have purchased this product to leave a review', 400));
  }

  const review = await Reviews.create({
    user: req.user.id,
    comment,
    rate,
    product: productId
  });

  const totalRatings = product.rateAvg * product.rateNum;
  product.rateNum += 1;
  product.rateAvg = (totalRatings + rate) / product.rateNum;
  await product.save();

  return res.status(201).json({
    status: 'success',
    message: 'Review added successfully',
    review
  });
});

//* ============================== Delete Review ======================================

export const deleteReview = asyncHandler(async (req, res, next) => {
  const { productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const review = await Reviews.findOneAndDelete({ _id: reviewId, user: req.user.id, product: productId });
  if (!review) {
    return next(new AppError('Review not found or not authorized to delete', 404));
  }

  if (product.rateNum > 0) {
    const totalRatings = product.rateAvg * product.rateNum;
    product.rateNum -= 1;
    product.rateAvg = product.rateNum > 0 ? (totalRatings - review.rate) / product.rateNum : 0;
  } else {
    product.rateNum = 0;
    product.rateAvg = 0;
  }
  await product.save();

  return res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully',
  });
});

//* ============================== Get Product Reviews ================================

export const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const apiFeature = new apiFeatures(
    Reviews.find({ product: productId }).populate({
      path: 'user',
      select: 'firstName lastName email',
    }),
    req.query
  )
    .filter()
    .select()
    .sort()
    .pagination()
    .search();

  const reviews = await apiFeature.mongooseQuery;

  return res.status(200).json({
    status: 'success',
    message: 'You added a review ',
    results: reviews.length,
    reviews
  });
});