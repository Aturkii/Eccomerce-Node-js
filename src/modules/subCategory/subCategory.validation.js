import Joi from 'joi';

//~ Create subcategory schema 
export const createSubCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.base': 'Subcategory name must be a string',
      'string.empty': 'Subcategory name cannot be empty',
      'string.min': 'Subcategory name must be at least 3 characters long',
      'string.max': 'Subcategory name cannot exceed 50 characters',
      'any.required': 'Subcategory name is required'
    })
});

//~ update subcategory schema 
export const updateSubCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .trim()
    .lowercase()
    .messages({
      'string.base': 'Subcategory name must be a string',
      'string.empty': 'Subcategory name cannot be empty',
      'string.min': 'Subcategory name must be at least 3 characters long',
      'string.max': 'Subcategory name cannot exceed 50 characters',
    })
});

//~ categoryId schema 
export const categoryId = Joi.object({
  categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"categoryId" must be a valid 24-character hexadecimal string`,
    'string.empty': `"categoryId" cannot be an empty field`,
    'any.required': `"categoryId" is a required field`
  })
});

//~ subCategoryId schema 
export const subCategoryId = Joi.object({
  subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"subCategoryId" must be a valid 24-character hexadecimal string`,
    'string.empty': `"subCategoryId" cannot be an empty field`,
    'any.required': `"subCategoryId" is a required field`
  })
});