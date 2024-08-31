import { Router } from "express";
import * as couponController from "./coupon.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { idSchema } from './../../utils/generalFields.js';
import * as couponValidation from "./coupon.validation.js";
import { validation } from './../../middleware/validationMiddleware.js';
import role from "../../utils/systemRoles.js";

const router = Router()

//^ Create Coupon 
router.post('/create-coupon',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(couponValidation.createCouponSchema),
  couponController.addCoupon
)

//^ Create Coupon 
router.put('/update-coupon/:id',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(couponValidation.updateCouponSchema),
  validation(idSchema, 'params'),
  couponController.updateCoupon
)

//^ Delete Coupon 
router.delete('/delete-coupon/:id',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  validation(idSchema, 'params'),
  couponController.deleteCoupon
)

//^ Get all Coupons 
router.get('/',
  authMiddleware(),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  couponController.getAllCoupons
)

//^ Get Specific Coupon 
router.get('/coupon/:id',
  validation(idSchema, 'params'),
  couponController.getCoupon
)


export default router;