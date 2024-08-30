import Joi from 'joi';

//~ Create brand schema 
export const createBrandSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.base': 'Brand name must be a string',
      'string.empty': 'Brand name cannot be empty',
      'string.min': 'Brand name must be at least 3 characters long',
      'string.max': 'Brand name cannot exceed 50 characters',
      'any.required': 'Brand name is required'
    })
});

//~ update brand schema 
export const updateBrandNameSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .lowercase()
    .required()
    .messages({
      'string.base': 'Brand name should be a string',
      'string.empty': 'Brand name cannot be empty',
      'string.min': 'Brand name should be at least 3 characters long',
      'string.max': 'Brand name should be less than or equal to 30 characters long',
      'any.required': 'Brand name is required'
    }),
  subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"subCategoryId" must be a valid 24-character hexadecimal string`,
    'string.empty': `"subCategoryId" cannot be an empty field`,
    'any.required': `"subCategoryId" is a required field`
  }),
  categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"CategoryId" must be a valid 24-character hexadecimal string`,
    'string.empty': `"CategoryId" cannot be an empty field`,
    'any.required': `"CategoryId" is a required field`
  })
});


export const paramsValidationSchema = Joi.object({
  categoryId: Joi.string().hex().length(24).required(),
  subCategoryId: Joi.string().hex().length(24).required(),
});