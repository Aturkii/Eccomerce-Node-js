import { Router } from "express";
import * as ProducController from "./product.controller.js";
import authMiddleware from './../../middleware/authMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import { idSchema } from './../../utils/generalFields.js';
import { validation } from './../../middleware/validationMiddleware.js';
import * as productValidation from "./product.validation.js";
import { multerHost, validFiles } from './../../middleware/multer.js';
const router = Router()

//& Add Product 
router.post('/add-product',
  authMiddleware(),
  multerHost(validFiles.image).fields([{ name: "image", maxCount: 1 }, { name: "coverImages", maxCount: 3 }]),
  authorizeRoles('admin', 'superadmin', 'administrator'),
  validation(productValidation.addProductSchema),
  ProducController.addProduct)

//& Update Product 
router.put('/update-product/:id',
  authMiddleware(),
  multerHost(validFiles.image).fields([{ name: "image", maxCount: 1 }, { name: "coverImages", maxCount: 3 }]),
  authorizeRoles('admin', 'superadmin', 'administrator'),
  validation(productValidation.updateProductSchema),
  validation(idSchema, 'params'),
  ProducController.updateProduct)

//& Delete Product 
router.post('/delete-product/:id',
  authMiddleware(),
  authorizeRoles('admin', 'superadmin', 'administrator'),
  validation(idSchema, 'params'),
  validation(productValidation.deleteProductIdSchema),
  ProducController.deleteProduct)

//& Get all Products
router.get('/',
  ProducController.getAllProducts)

//& Get Specific Product
router.get('/product/:id',
  validation(idSchema, 'params'),
  ProducController.getSpecificProduct)


export default router;