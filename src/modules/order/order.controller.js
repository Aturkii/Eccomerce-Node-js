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
import fs from 'fs';
import { sendEmail } from './../../service/sendEmail.js';
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
    console.error('Email send error:', error);
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

export const stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const buf = await buffer(req);
    event = stripeClient.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return next(new AppError(`Webhook Error: ${err.message}`, 400));
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Retrieve user and cart info
    const user = await User.findOne({ email: session.customer_email });
    const cart = await Cart.findById(session.client_reference_id);

    if (!user || !cart) {
      return next(new AppError('User or Cart not found', 404));
    }

    // Create the order
    const order = new Order({
      user: user._id,
      products: cart.products,
      address: JSON.parse(session.metadata.address),
      totalPrice: cart.totalPrice,
      discount: cart.discount || 0,
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount || cart.totalPrice,
      coupon: cart.coupon,
      isPlaced: true,
      paymentMethod: 'Stripe',
      isPaid: true,
      paidAt: new Date()
    });

    await order.save();

    // Update product stock
    await Promise.all(order.products.map(async (product) => {
      await Product.findByIdAndUpdate(product.productId, {
        $inc: { stock: -product.quantity }
      });
    }));

    // Generate the invoice
    const invoiceData = {
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
      paid: order.totalPriceAfterDiscount,
      invoice_nr: order._id.toString(),
      date: order.createdAt,
      discount: order.discount
    };

    const invoiceBuffer = await createInvoice(invoiceData);

    // Upload invoice to Cloudinary
    let result;
    try {
      result = await cloudinary.uploader.upload_stream({
        resource_type: "raw",
        folder: `Ecommerce/Orders/`,
        public_id: `order_${order._id}`
      }).end(invoiceBuffer);
    } catch (error) {
      return next(new AppError("Failed to upload invoice to Cloudinary", 500));
    }

    // Save OrderReceipt in the database
    const orderReceipt = new OrderReceipt({
      order: order._id,
      receiptPdfUrl: result.secure_url,
      status: {
        isDelivered: order.isDelivered,
        isPaid: order.isPaid
      },
      paymentMethod: order.paymentMethod
    });

    await orderReceipt.save();

    // Optionally, send the invoice via email (if you want)
    const attachment = [{ content: invoiceBuffer, filename: `invoice_${order._id}.pdf`, contentType: "application/pdf" }];
    try {
      const emailSubject = 'Your Order Receipt';
      const emailHtml = `<p>Thank you for your purchase! Please find your invoice attached.</p>`;
      await sendEmail(user.email, emailSubject, emailHtml, attachment);
    } catch (error) {
      console.error('Email send error:', error);
    }

    // Clear the cart
    await Cart.findByIdAndDelete(session.client_reference_id);

    return res.status(200).json({ received: true });
  } else {
    return next(new AppError(`Unhandled event type ${event.type}`, 400));
  }
});
//* ============================= Get Own Order ================================

export const getOwnOrders = asyncHandler(async (req, res, next) => {

  const orders = await Order.find({ user: req.user.id }).populate({
    path: "products.productId",
    select: "-_id -slug -addedBy -customId"
  })
  return res.status(200).json(orders)
})

//* ============================= Get Spcific User Order ========================

export const getUserOrders = asyncHandler(async (req, res, next) => {
  const { userId } = req.params
  const orders = await Order.find({ user: userId }).populate({
    path: "products.productId",
    select: "-_id -slug -addedBy -customId"
  })
  return res.status(200).json(orders)
})

//* ============================= Get All Orders ================================
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate({
    path: "products.productId",
    select: "-_id -slug -addedBy -customId"
  })
  return res.status(200).json(orders)

})

//* ============================= Cancel Order ==================================

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const orderExist = await Order.findOne({ _id: id, user: req.user.id, isCanceled: false })
  if (!orderExist) {
    return res.status(404).json({ message: "Order not found" })
  }
  if ((orderExist.paymentMethod === "cash" && orderExist.isShipped === true) || (orderExist.paymentMethod == "card" && orderExist.isShipped === true)) {
    return res.status(400).json({ message: "Order cannot be cancelled" })
  }

  orderExist.isCanceled = true

  await orderExist.save()

  if (orderExist.coupon) { await Coupon.findOneAndUpdate({ code: orderExist.coupon }, { $pull: { usedBy: req.user.id } }) }

  for (const product of orderExist.products) {
    await Product.findByIdAndUpdate(product.productId, { $inc: { stock: product.quantity } })

  }
  return res.status(201).json({ msg: "order is cancelled successfully" })
})