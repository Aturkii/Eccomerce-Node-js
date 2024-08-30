import { Router } from "express";
import * as categoryController from "./category.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { multerHost, validFiles } from "../../middleware/multer.js";
import { validation } from './../../middleware/validationMiddleware.js';
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";
import { idSchema } from './../../utils/generalFields.js';


const router = Router()

//^ Create Categories 
router.post('/Create-category',
  multerHost(validFiles.image).single("image"),
  authMiddleware(),
  validation(createCategorySchema),
  authorizeRoles('superadmin', 'administrator'),
  categoryController.createCategory
)

//^ Update Categories 
router.put('/update-category/:id',
  multerHost(validFiles.image).single("image"),
  authMiddleware(),
  authorizeRoles('superadmin', 'administrator'),
  validation(updateCategorySchema),
  validation(idSchema, 'params'),
  categoryController.updateCategory
)

//^ Delete Categories 
router.delete('/delete-category/:id',
  authMiddleware(),
  authorizeRoles('superadmin', 'administrator'),
  validation(idSchema, 'params'),
  categoryController.deleteCategory
)

//^ Get all Categories 
router.get('/',
  categoryController.getCategories
)

//^ Get specific Category 
router.get('/category/:name',
  validation(createCategorySchema,'params'),
  categoryController.getCategory);

export default router;