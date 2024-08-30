import { Router } from "express";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { validation } from './../../middleware/validationMiddleware.js';
import * as subCategoryRouter from "./subCategory.controller.js";
import * as subCategoryValidation from "./subCategory.validation.js";
import { multerHost, validFiles } from "../../middleware/multer.js";
import { idSchema } from './../../utils/generalFields.js';

const router = Router()


//? create SubCategory 
router.post('/createSubcategory/:id',
  authMiddleware(),
  multerHost(validFiles.image).single("image"),
  validation(idSchema, 'params'),
  validation(subCategoryValidation.createSubCategorySchema),
  authorizeRoles('superadmin', 'administrator'),
  subCategoryRouter.createSubCategory
)

//? Update SubCategory
router.put('/update-subcategory/:categoryId/:subCategoryId',
  authMiddleware(),
  authorizeRoles('superadmin', 'administrator'),
  multerHost(validFiles.image).single("image"),
  validation(subCategoryValidation.updateSubCategorySchema),
  subCategoryRouter.updateSubCategory
);

//? Delete subcategory
router.delete('/delete-subcategory/:categoryId/:subCategoryId',
  authMiddleware(),
  validation(subCategoryValidation.categoryId, 'params'),
  validation(subCategoryValidation.subCategoryId, 'params'),
  authorizeRoles('superadmin', 'administrator'),
  subCategoryRouter.deleteSubcategories
);

//? Get all subcategories
router
  .route('/')
  .get(subCategoryRouter.getSubCategories);

//? Get a specific subcategory by ID
router.get('/subcategory/:id',
  validation(idSchema, 'params'),
  subCategoryRouter.getSubCategory);

export default router;