import { Router } from "express";
import * as brandController from "./brand.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { idSchema } from './../../utils/generalFields.js';
import { validation } from './../../middleware/validationMiddleware.js';
import * as brandValidation from "./brand.validation.js";
import { multerHost, validFiles } from './../../middleware/multer.js';
import role from "../../utils/systemRoles.js";


const router = Router()

//& Create a new Brand
router.post(
  '/create-brand/:categoryId/:subCategoryId',
  multerHost(validFiles.image).single("image"),
  authMiddleware(),
  validation(brandValidation.paramsValidationSchema, 'params'),
  validation(brandValidation.createBrandSchema),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  brandController.createBrand
);

//& Update Brand
router.put(
  '/update-brand/:id',
  multerHost(validFiles.image).single("image"),
  authMiddleware(),
  validation(idSchema, 'params'),
  validation(brandValidation.updateBrandNameSchema),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  brandController.updateBrand
);

//& Delete Brand
router.post(
  '/delete-brand/:id',
  authMiddleware(),
  validation(idSchema, 'params'),
  validation(brandValidation.paramsValidationSchema),
  authorizeRoles(role.admin, role.superadmin, role.administrator),
  brandController.deleteBrand
);

//& Get all Brands
router.get('/',
  brandController.getBrands
)

//& Get Speecific Brands

router.get(
  '/brand/:id',
  brandController.getSpecificBrand
);


export default router;