import Stripe from 'stripe';
import Cart from './../../../db/models/cart/cart.model.js';
import Order from './../../../db/models/order/order.model.js';
import Product from './../../../db/models/product/product.mode.js';
import Coupon from './../../../db/models/coupon/coupon.model.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { AppError } from './../../utils/errorClass.js';
import OrderReceipt from './../../../db/models/order/orderReceipt.model.js';
import cloudinary from "../../utils/cloudinary.js";
import dotenv from 'dotenv';
import User from './../../../db/models/user/user.model.js';
import { createInvoice } from './../../utils/pdf.js';
import { sendEmail } from './../../service/sendEmail.js';
import { apiFeatures } from '../../utils/apiFeatures.js';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET);

//* ============================= Create Order ================================

export const createOrder = asyncHandler(async (req, res, next) => {
  const { address } = req.body;

  const user = await User.findById(req.user.id);
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) return next(new AppError("Cart is empty", 400));
  if (!user) return next(new AppError("User not found", 404));

  const discount = cart.discount || 0;
  const totalPriceAfterDiscount = cart.totalPriceAfterDiscount || cart.totalPrice;

  const order = new Order({
    user: req.user.id,
    products: cart.products,
    address: address || user.addresses[0],
    totalPrice: cart.totalPrice,
    discount,
    totalPriceAfterDiscount,
    coupon: cart.coupon,
    isPlaced: true
  });

  await order.save();

  await Promise.all(order.products.map(async (product) => {
    await Product.findByIdAndUpdate(product.productId, {
      $inc: { stock: -product.quantity }
    });
  }));

  if (cart.coupon) {
    await Coupon.findOneAndUpdate(
      { code: cart.coupon },
      { $push: { usedBy: req.user.id } }
    );
  }

  const invoice = {
    shipping: {
      name: `${user.firstName} ${user.lastName}`,
      address: `${order.address.buildingNumber} ${order.address.street}, ${order.address.state}`,
      city: order.address.city,
      state: order.address.state,
      country: order.address.country,
      postal_code: order.address.zipCode
    },
    items: order.products.map(product => ({
      title: product.title,
      quantity: product.quantity,
      price: product.price
    })),
    subtotal: order.totalPrice,
    paid: totalPriceAfterDiscount,
    invoice_nr: order._id.toString(),
    date: order.createdAt,
    discount
  };

  const invoiceBuffer = await createInvoice(invoice);

  const uploadInvoiceToCloudinary = (buffer, orderId, callback) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `Ecommerce/Orders/`,
        public_id: `order_${orderId}`
      },
      callback
    );

    stream.end(buffer);
  };

  let cloudinaryResponse;
  try {
    cloudinaryResponse = await new Promise((resolve, reject) => {
      uploadInvoiceToCloudinary(invoiceBuffer, order._id, (error, result) => {
        if (error) {
          return reject(new AppError('Failed to upload invoice to Cloudinary', 500));
        }
        resolve(result);
      });
    });

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      throw new AppError('Failed to retrieve Cloudinary response', 500);
    }
  } catch (error) {
    return next(error);
  }

  const orderReceipt = new OrderReceipt({
    order: order._id,
    receiptPdfUrl: cloudinaryResponse.secure_url,
    status: {
      isDelivered: order.isDelivered,
      isPaid: order.isPaid
    },
    paymentMethod: order.paymentMethod
  });

  await orderReceipt.save();

  const attachment = [{ content: invoiceBuffer, filename: `invoice_${order._id}.pdf`, contentType: "application/pdf" }];
  try {
    const emailSubject = 'Order Details';
    const emailHtml = `<p>Your order has been placed successfully. Please find the details attached.</p>`;
    await sendEmail(user.email, emailSubject, emailHtml, attachment);
  } catch (error) {
    return next(new AppError('Failed to send order details. Please try again later.', 500));
  }

  await Cart.findOneAndDelete({ user: req.user.id });

  return res.status(201).json({
    status: "success",
    message: "Order created successfully",
    order,
    receiptUrl: orderReceipt.receiptPdfUrl
  });
});

//* ============================= Checkout Session =============================

export const CheckOutSession = asyncHandler(async (req, res, next) => {
  const { address } = req.body;
  const user = await User.findById({ _id: req.user.id });
  const cart = await Cart.findOne({ user: req.user.id });
  if (!user) {
    return next(new AppError('User Not Found', 400));
  }

  if (!cart) {
    return next(new AppError('Cart is empty', 400));
  }

  const totalPriceAfterDiscount = cart.totalPriceAfterDiscount || cart.totalPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: Math.round(totalPriceAfterDiscount * 100),
          product_data: {
            name: `${user.firstName} ${user.lastName}`,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.headers.host}/orders`,
    cancel_url: `${req.protocol}://${req.headers.host}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(),
    metadata: {
      address: JSON.stringify(address),
    },
  });

  return res.status(200).json({
    status: "success",
    message: "You checkedout successfully",
    session
  });

});

//* ============================= Web Hook =====================================

export const createWebHook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSessionCompleted = event.data.object;

    const user = await User.findOne({ email: checkoutSessionCompleted.customer_email });
    const cart = await Cart.findById(checkoutSessionCompleted.client_reference_id);

    if (!user) return next(new AppError('User not found', 404));
    if (!cart) return next(new AppError('Cart not found', 404));

    const order = new Order({
      user: user._id,
      products: cart.products,
      address: JSON.parse(checkoutSessionCompleted.metadata.address),
      totalPrice: cart.totalPrice,
      discount: cart.discount || 0,
      totalPriceAfterDiscount: checkoutSessionCompleted.amount_total / 100,
      coupon: cart.coupon,
      paymentMethod: "card",
      isPlaced: true,
      isPaid: true,
      paidAt: Date.now(),
    });

    await order.save();

    await Promise.all(order.products.map(async (product) => {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: { stock: -product.quantity }
      });
    }));

    if (cart.coupon) {
      await Coupon.findOneAndUpdate({ code: cart.coupon }, { $push: { usedBy: user._id } });
    }

    await Cart.findByIdAndDelete(checkoutSessionCompleted.client_reference_id);

    return res.status(201).json({
      status: 'success',
      message: "Order created successfully", order
    });
  } else {
    return res.status(400).send(`Unhandled event type ${event.type}`);
  }
});

//* ============================= Get Own Order ================================

export const getOwnOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await Order.find({ user: userId }).populate({
    path: "products.productId",
    select: "-_id -slug -addedBy -customId",
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No orders found for this user.",
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});

//* ============================= Get Spcific User Order ========================

export const getSpecificUserOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const orders = await Order.find({ user: id }).populate({
    path: "products.productId",
    select: "-_id -slug -addedBy -customId",
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No orders found for this user.",
    });
  }

  return res.status(200).json({
    status: "success",
    data: {
      orders,
    },
  });
});

//* ============================= Get All Orders ================================

export const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const features = new ApiFeatures(Order.find()
      .populate({
        path: "products.productId",
        select: "-_id -slug -addedBy -customId",
      }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const orders = await features.query;

    const totalOrders = await Order.countDocuments();


    return res.status(200).json({
      status: "success",
      results: orders.length,
      totalResults: totalOrders,
      data: {
        orders,
      },
    });
  } catch (error) {
    return next(new AppError('Failed to retrieve orders', 500));
  }
});

//* ============================= Cancel Order ==================================

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id, user: req.user.id, isCanceled: false });

    if (!order) {
      return res.status(404).json({ status: "fail", message: "Order not found or already canceled" });
    }

    if (order.isShipped) {
      return res.status(400).json({ status: "fail", message: "Order cannot be canceled after it has been shipped" });
    }

    order.isCanceled = true;

    if (order.coupon) {
      await Coupon.findOneAndUpdate(
        { code: order.coupon },
        { $pull: { usedBy: req.user.id } }
      );
    }

    for (const product of order.products) {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: { stock: product.quantity },
      });
    }

    await order.save();

    return res.status(200).json({
      status: "success",
      message: "Order has been canceled successfully",
      order,
    });

  } catch (error) {
    return next(new AppError('Failed to cancel order. Please try again later.', 500));
  }
});

//* ============================= Get All Orders Reciepts ================================

export const getAllOrderReceipts = asyncHandler(async (req, res, next) => {
  try {
    const features = new apiFeatures(OrderReceipt.find()
      .populate({
        path: "order",
        populate: {
          path: "products.productId",
          select: "-_id -slug -addedBy -customId",
        },
      }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const orderReceipts = await features.query;

    const totalOrderReceipts = await OrderReceipt.countDocuments();

    return res.status(200).json({
      status: "success",
      results: orderReceipts.length,
      totalResults: totalOrderReceipts,
      data: {
        orderReceipts,
      },
    });
  } catch (error) {
    return next(new AppError('Failed to retrieve order receipts', 500));
  }
});