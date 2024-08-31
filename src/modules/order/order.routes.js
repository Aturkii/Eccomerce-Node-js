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

//?___________ Web hook   
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  orderController.createWebHook)

//? Get Own order   
router.get('/order',
  authMiddleware(),
  authorizeRoles(role.user),
  orderController.getOwnOrder)

//? Get Specific user order   
router.get('/user-order/:id',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(idSchema, 'params'),
  orderController.getSpecificUserOrders)

//? Get all order (admin's only)
router.get('/all-orders',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  orderController.getAllOrders)

//? cancel order   
router.delete('/cancel-order/:id',
  authMiddleware(),
  authorizeRoles(role.user),
  orderController.cancelOrder)

//? Get all order reciepts (admin's only)
router.get('/all-orders-receipts',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  orderController.getAllOrderReceipts)

export default router;