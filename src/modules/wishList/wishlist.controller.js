import { AppError } from '../../utils/errorClass.js';
import Product from './../../../db/models/product/product.mode.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import WishList from './../../../db/models/wishList/wishlist.model.js';
import { apiFeatures } from './../../utils/apiFeatures.js';


//* =========================== Add To WishList =========================================

export const addToWishList = asyncHandler(async (req, res, next) => {

  const { productId } = req.params
  const product = await Product.findById(productId)
  if (!product) {
    return next(new AppError('Product not found', 404))
  }

  const wishList = await WishList.findOne({ user: req.user.id })

  if (!wishList) {
    const newWishList = await WishList.create({ user: req.user.id, products: [productId] })
    req.data = {
      model: WishList,
      id: newWishList._id
    }
    return res.status(201).json({ message: 'Product added to wish list', wishList: newWishList })
  }

  const newWishList = await WishList.findOneAndUpdate({ user: req.user.id },
    { $addToSet: { products: productId } }, { new: true }).populate({
      path: 'products',
      select: 'name price image coverImage'
    })
  return res.status(200).json({
    status: "success",
    message: 'Product added to wish list',
    wishList: newWishList
  })

})

//* =========================== Remove From WishList ====================================

export const removeFromWishList = asyncHandler(async (req, res, next) => {

  const { productId } = req.params
  const product = await Product.findById(productId)

  if (!product) {
    return next(new AppError('Product not found', 404))
  }

  const wishList = await WishList.findOne({ user: req.user.id, "products": productId })
  if (!wishList) {
    return next(new AppError('Product not found in wish list', 404))
  }
  const newWishList = await WishList.findOneAndUpdate({ user: req.user.id }, { $pull: { products: productId } }, { new: true }).populate({
    path: 'products',
    select: 'name price'
  })
  return res.status(200).json({
    status: "success",
    message: 'Product deleted from wish list', wishList: newWishList
  })

})

//* =========================== Get User WishList =========================================

export const getUserWishList = asyncHandler(async (req, res, next) => {
  try {
    const query = WishList.find({ user: req.user.id });

    const apiFeature = new apiFeatures(query, req.query)
      .filter()
      .select()
      .sort()
      .pagination()
      .search();

    apiFeature.mongooseQuery.populate({
      path: 'products',
      select: 'name price image coverImage'
    });

    const wishList = await apiFeature.mongooseQuery;

    return res.status(200).json({
      status: "success",
      wishList
    });
  } catch (error) {
    return next(new AppError("Failed to retrieve wish list", 500));
  }
});
