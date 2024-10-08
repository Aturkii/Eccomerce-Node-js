import { Router } from "express";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { validation } from './../../middleware/validationMiddleware.js';
import { idSchema } from './../../utils/generalFields.js';
import * as cartController from "./cart.controller.js";
import { addToCartSchema, coupon, quantity } from "./cart.validation.js";
import role from "../../utils/systemRoles.js";

const router = Router()

//& Add to cart
router.post('/add-to-cart',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(addToCartSchema),
  cartController.addToCart
)

//& Update cart Quantity
router.put('/update-cart-quantity/:id',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(quantity),
  validation(idSchema, 'params'),
  cartController.updateQuantity
)

//& Remove cart item
router.delete('/remove-cart-item/:id',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(idSchema, 'params'),
  cartController.removeItem
)

//& Get user cart
router.get('/',
  authMiddleware(),
  authorizeRoles(role.user),
  cartController.getUserCart
)

//& Clear cart
router.delete('/clear-cart',
  authMiddleware(),
  authorizeRoles(role.user),
  cartController.clearCart
)

//& Apply Coupon
router.post('/apply-coupon',
  authMiddleware(),
  validation(coupon),
  authorizeRoles(role.admin, role.superadmin, role.administrator,role.user),
  cartController.applyCoupon
)

export default router;