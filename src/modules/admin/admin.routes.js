import express from 'express';
import * as adminController from './admin.controller.js';
import authMiddleware from './../../middleware/authMiddleware.js';
import { validation } from './../../middleware/validationMiddleware.js';
import authorizeRoles from './../../middleware/auth.roles.js';
import * as adminValidation from './admin.validation.js';
import { idSchema } from './../../utils/generalFields.js';
import role from '../../utils/systemRoles.js';

const router = express.Router();


//& Application for administration
router.post('/apply-for-admin',
  authMiddleware(),
  authorizeRoles(role.user),
  validation(adminValidation.adminApplicationSchema),
  adminController.applyForAdmin);

//& Update application
router.post("/update-application/:applicationId",
  authMiddleware(),
  validation(idSchema, 'params'),
  authorizeRoles(role.administrator),
  validation(adminValidation.updateAdminApplicationStatusSchema),
  adminController.updateAdminApplicationStatus)

//& Get all applications
router.post("/all-applications",
  authMiddleware(),
  authorizeRoles(role.administrator),
  adminController.getAdminApplications)

//& Get all applications
router.post("/all-archived-applications",
  authMiddleware(),
  authorizeRoles(role.administrator),
  adminController.getArchivedApplications)


export default router;
