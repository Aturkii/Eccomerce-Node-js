import Joi from "joi";

//? Application schema
export const adminApplicationSchema = Joi.object({
  applicationMessage: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Application message is required.',
      'string.min': 'Application message must be at least 10 characters long.',
      'string.max': 'Application message must be less than 500 characters long.',
    }),
  role: Joi.string()
    .valid('admin', 'superadmin')
    .required()
    .messages({
      'string.empty': 'Role is required.',
      'any.only': 'Role must be either "admin" or "superadmin".',
    }),
});

//? Update application  
export const updateAdminApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected')
    .required()
    .messages({
      'any.only': 'Status must be either "approved" or "rejected".',
      'string.empty': 'Status is required.',
    }),
});