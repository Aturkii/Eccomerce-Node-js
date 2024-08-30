import Stripe from 'stripe';
import Cart from './../../../db/models/cart/cart.model.js';
import Order from './../../../db/models/order/order.model.js';
import Product from './../../../db/models/product/product.mode.js';
import Coupon from './../../../db/models/coupon/coupon.model.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { AppError } from './../../utils/errorClass.js';
import dotenv from 'dotenv';
dotenv.config();


const stripe = new Stripe(process.env.STRIPE_SECRET);

//* ============================= Create Order ================================

export const createCashOrder = asyncHandler(async (req, res, next) => {

  const { address } = req.body
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) return next(new AppError('Cart is empty', 400))

  let discount = cart.discount || ""
  let totalPriceAfterDiscount = cart.totalPriceAfterDiscount || cart.totalPrice

  const order = new Order({
    user: req.user.id,
    products: cart.products,
    address: address || req.user.addresses[0],
    totalPrice: cart.totalPrice,
    discount: discount,
    totalPriceAfterDiscount: totalPriceAfterDiscount,
    coupon: cart.coupon,
    isPlaced: true
  })
  await order.save()
  req.data = {
    model: Order,
    id: order._id
  }

  for (const product of order.products) {
    await Product.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } })

  }
  if (cart.coupon) {
    await Coupon.findOneAndUpdate({ code: cart.coupon }, { $push: { usedBy: req.user.id } })
  }

  await Cart.findOneAndDelete({ user: req.user.id })

  const invoice = {
    shipping: {
      name: `${req.user.firstName} ${req.user.lastName}`,
      address: ` ${order.address.buildingNumber} ${order.address.street},${order.address.state}`,
      city: order.address.city,
      state: order.address.state,
      country: "Egypt",
      postal_code: order.address.zipCode
    },
    items: order.products,
    subtotal: order.totalPrice,
    paid: order.totalPriceAfterDiscount,
    invoice_nr: order._id,
    date: order.createdAt,
    discount: order.discount || 0
  };

  createInvoice(invoice, "invoice.pdf");
  await sendEmail(req.user.email, "Order Placed", `<p>Your Order details</p>`, [
    {
      path: "invoice.pdf",
      contentType: "application/pdf"
    }
  ])
  return res.status(201).json({ message: "Order created successfully", order })
})

//* ============================= Checkout Session =============================

export const createCheckOutSession = asyncHandler(async (req, res, next) => {
  const { address } = req.body
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) return next(new AppError('Cart is empty', 400))
  let totalPriceAfterDiscount = cart.totalPriceAfterDiscount || cart.totalPrice
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalPriceAfterDiscount * 100,
          product_data: {
            name: `${req.user.firstName} ${req.user.lastName}`
          }
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.headers.host}/orders`,
    cancel_url: `${req.protocol}://${req.headers.host}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(),
    metadata: address

  });

  return res.status(200).json({ msg: "Success", session })

})

//* ============================= Web Hook =====================================

export const createWebHook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event, checkoutSessionCompleted;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    checkoutSessionCompleted = event.data.object;

    const user = await userModel.findOne({ email: checkoutSessionCompleted.customer_email });
    const cart = await Cart.findById(checkoutSessionCompleted.client_reference_id);
    if (!cart) return next(new AppError('Cart is empty', 400));

    const order = new Order({
      user: user._id,
      products: cart.products,
      address: checkoutSessionCompleted.metadata,
      totalPrice: cart.totalPrice,
      discount: cart.discount || "",
      totalPriceAfterDiscount: checkoutSessionCompleted.amount_total / 100,
      coupon: cart.coupon,
      paymentMethod: "card",
      isPlaced: true,
      isPaid: true,
    });

    await order.save();
    req.data = { model: Order, id: order._id };

    for (const product of order.products) {
      await Product.findByIdAndUpdate(product.productId, { $inc: { stock: -product.quantity } });
    }

    if (cart.coupon) {
      await Coupon.findOneAndUpdate({ code: cart.coupon }, { $push: { usedBy: user._id } });
    }

    await Cart.findByIdAndDelete(checkoutSessionCompleted.client_reference_id);

    // const invoice = {
    //   shipping: {
    //     name: `${user.firstName} ${user.lastName}`,
    //     address: `${order.address.buildingNumber} ${order.address.street}, ${order.address.state}`,
    //     city: order.address.city,
    //     state: order.address.state,
    //     country: "Egypt",
    //     postal_code: order.address.zipCode,
    //   },
    //   items: order.products,
    //   subtotal: order.totalPrice,
    //   paid: order.totalPriceAfterDiscount,
    //   invoice_nr: order._id,
    //   date: order.createdAt,
    //   discount: order.discount || 0,
    // };

    // createInvoice(invoice, "invoice.pdf");
    // await sendEmail(user.email, "Order Placed", `<p>Your Order details</p>`, [
    //   {
    //     path: "invoice.pdf",
    //     contentType: "application/pdf",
    //   },
    // ]);

    return res.status(201).json({ message: "Order created successfully", order });
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