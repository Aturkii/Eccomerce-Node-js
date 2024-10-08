import { Router } from "express";
import * as wishListController from "./wishlist.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { validation } from './../../middleware/validationMiddleware.js';
import { productId } from "./wishlist.validation.js";
import role from "../../utils/systemRoles.js";



const router = Router()

//! Add To Wishlist 
router.post('/add-to-wishlist/:productId',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(productId,'params'),
  wishListController.addToWishList
)

//! Remove From Wishlist 
router.delete('/remove-from-wishlist/:productId',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(productId,'params'),
  wishListController.removeFromWishList)

//! Get User Wishlist 
router.get('/',
  authMiddleware(),
  authorizeRoles(role.user),
  wishListController.getUserWishList)


export default router;