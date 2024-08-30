import { Router } from "express";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { validation } from './../../middleware/validationMiddleware.js';
import { idSchema } from './../../utils/generalFields.js';
import * as orderController from "./order.controller.js";
import { addressSchema } from "./order.validation.js";
import role from "../../utils/systemRoles.js";



const router = Router()

router.post('/create-order',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(addressSchema),
  orderController.createOrder
)


export default router;