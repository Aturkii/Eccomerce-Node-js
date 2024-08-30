import Joi from 'joi';

//? Create Category 
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .lowercase()
    .required()
    .messages({
      'string.base': 'Category name must be a string',
      'string.min': 'Category name must be at least 3 characters long',
      'string.max': 'Category name cannot exceed 50 characters',
      'any.required': 'Category name is required',
      'string.empty': 'Category name cannot be empty',
    })
});

//? Update Category
export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .lowercase()
    .messages({
      'string.base': 'Category name must be a string',
      'string.min': 'Category name must be at least 3 characters long',
      'string.max': 'Category name cannot exceed 50 characters',
      'string.empty': 'Category name cannot be empty',
    })
});