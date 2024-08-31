import express, { Router } from "express";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { validation } from './../../middleware/validationMiddleware.js';
import { idSchema } from './../../utils/generalFields.js';
import * as orderController from "./order.controller.js";
import { addressSchema } from "./order.validation.js";
import role from "../../utils/systemRoles.js";



const router = Router()

//? Create an Order 
router.post('/create-order',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(addressSchema),
  orderController.createOrder
)

//? Create an Order   
router.post('/checkout',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(addressSchema),
  orderController.CheckOutSession
)

//? Web hook   
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  orderController.stripeWebhook)


export default router;