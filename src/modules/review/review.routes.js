import { Router } from "express";
import { productId } from './../wishList/wishlist.validation.js';
import * as reviewController from "./review.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import role from "../../utils/systemRoles.js";
import { validation } from './../../middleware/validationMiddleware.js';
import { removeReviewSchema, reviewSchema } from "./review.validation.js";



const router = Router()

//? Add Review 
router.post("/addReview/:productId",
  authMiddleware(),
  authorizeRoles(role.user),
  validation(productId, 'params'),
  validation(reviewSchema),
  reviewController.addReview
)

//? remove Review 
router.delete("/remove-review/:productId/:reviewId",
  authMiddleware(),
  authorizeRoles(role.user),
  validation(removeReviewSchema, 'params'),
  reviewController.deleteReview
)

//? Get Product reviews
router.get('/:productId',
  validation(productId,'params'),
  reviewController.getProductReviews

)

export default router;