
import { asyncHandler } from './../../utils/asyncHandler.js';
import Product from './../../../db/models/product/product.mode.js';
import Cart from './../../../db/models/cart/cart.model.js';
import { AppError } from './../../utils/errorClass.js';
import { totalPrice, calcPrice } from './../../utils/calcPrice.js';
import Coupon from './../../../db/models/coupon/coupon.model.js';


//* ============================= Add To Cart =======================================

export const addToCart = asyncHandler(async (req, res, next) => {
    const { product, quantity } = req.body;

    const productExist = await Product.findById(product);
    if (!productExist) {
        return next(new AppError('Product not found', 404));
    }

    if (quantity > productExist.stock) {
        return next(new AppError('Quantity exceeds stock', 400));
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user.id,
            products: [{
                title: productExist.title,
                productId: product,
                quantity,
                price: productExist.subPrice
            }],
            totalPrice: quantity * productExist.subPrice
        });
    } else {
        let productInCart = cart.products.find(item => item.productId.toString() === product);

        if (productInCart) {
            productInCart.quantity += quantity;

            if (productInCart.quantity > productExist.stock) {
                productInCart.quantity -= quantity;
                return next(new AppError('Quantity exceeds stock', 400));
            }
        } else {
            cart.products.push({
                title: productExist.title,
                productId: product,
                quantity,
                price: productExist.subPrice
            });
        }

        cart.totalPrice = cart.products.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    }

    await cart.save();
    return res.status(200).json({
        status: "success",
        message: "Product added successfully to cart",
        cart
    });
});

//* ============================= Update Cart Quantity ===============================

export const updateQuantity = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
        return next(new AppError('Quantity must be greater than zero', 400));
    }

    const product = await Product.findById(id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    const cartProduct = cart.products.find(p => p.productId.toString() === id);
    if (!cartProduct) {
        return next(new AppError('Product not found in the cart', 404));
    }

    cartProduct.quantity = quantity;

    cart.totalPrice = cart.products.reduce((total, item) =>
        total + (item.price * item.quantity), 0);

    await cart.save();

    return res.status(200).json({
        status: 'success',
        message: 'Product quantity updated successfully',
        cart
    });
});

//* ============================= Remove From Cart ====================================

export const removeItem = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $pull: { products: { productId: id } } },
        { new: true }
    );

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.totalPrice = cart.products.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();

    return res.status(200).json({
        status: 'success',
        message: 'Product removed from cart successfully',
        cart
    });
});

//* ============================= Get User Cart =======================================

export const getUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
        path: 'products.productId',
        select: 'name price image coverImage'
    });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    return res.status(200).json({
        status: 'success',
        cart
    });
});

//* ============================= Clear Cart ==========================================

export const clearCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndDelete({ user: req.user.id });

    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    return res.status(200).json({
        status: 'success',
        message: 'Cart cleared successfully'
    });
});

//* ============================= Apply Coupon =========================================

export const applyCoupon = asyncHandler(async (req, res, next) => {
    const { coupon } = req.body;

    const couponExist = await Coupon.findOne({ code: coupon.toLowerCase() });
    if (!couponExist) {
        return next(new AppError('Coupon not found', 404));
    }

    if (couponExist.endDate < Date.now()) {
        return next(new AppError('Coupon has expired', 400));
    }

    if (couponExist.usedBy.includes(req.user.id)) {
        return next(new AppError('Coupon has already been used', 409));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }

    cart.discount = couponExist.amount;
    cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * couponExist.amount) / 100;
    cart.coupon = coupon;

    await cart.save();

    couponExist.usedBy.push(req.user.id);
    await couponExist.save();

    return res.status(200).json({
        status: 'success',
        message: 'Coupon applied successfully',
        cart
    });
});
