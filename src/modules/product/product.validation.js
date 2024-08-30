import Joi from "joi";

//? add Product Schema 
export const addProductSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(60)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.base': 'Title should be a type of text',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 60 characters',
      'any.required': 'Title is required',
    }),

  description: Joi.string()
    .min(10)
    .max(900)
    .trim()
    .required()
    .messages({
      'string.base': 'Description should be a type of text',
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 900 characters',
      'any.required': 'Description is required',
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required',
    }),

  discount: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Discount must be a number',
      'number.min': 'Discount cannot be less than 0',
      'number.max': 'Discount cannot exceed 100',
    }),

  category: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.base': 'Category must be a string',
      'string.hex': 'Category must be a valid ObjectId',
      'string.length': 'Category must be a 24-character ObjectId',
      'any.required': 'Category is required',
      'string.empty': 'Category is required',
    }),

  subCategory: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.base': 'SubCategory must be a string',
      'string.hex': 'SubCategory must be a valid ObjectId',
      'string.length': 'SubCategory must be a 24-character ObjectId',
      'any.required': 'SubCategory is required',
      'string.empty': 'SubCategory is required',
    }),

  brand: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.base': 'Brand must be a string',
      'string.hex': 'Brand must be a valid ObjectId',
      'string.length': 'Brand must be a 24-character ObjectId',
      'any.required': 'Brand is required',
      'string.empty': 'Brand is required',
    }),

  stock: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Stock must be a number',
      'number.positive': 'Stock must be a positive number',
      'any.required': 'Stock is required',
    })
});

//? update Product Schema 
export const updateProductSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(60)
    .lowercase()
    .messages({
      'string.base': 'Title should be a type of string',
      'string.empty': 'Title cannot be an empty field',
      'string.min': 'Title should have a minimum length of {#limit}',
      'string.max': 'Title should have a maximum length of {#limit}',
      'any.required': 'Title is a required field'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(900)
    .messages({
      'string.base': 'Description should be a type of string',
      'string.empty': 'Description cannot be an empty field',
      'string.min': 'Description should have a minimum length of {#limit}',
      'string.max': 'Description should have a maximum length of {#limit}',
    }),

  price: Joi.number()
    .min(1)
    .messages({
      'number.base': 'Price should be a number',
      'number.min': 'Price should be at least {#limit}',
    }),

  discount: Joi.number()
    .min(0)
    .max(100)
    .messages({
      'number.base': 'Discount should be a number',
      'number.min': 'Discount cannot be less than {#limit}',
      'number.max': 'Discount cannot be more than {#limit}',
    }),

  category: Joi.string()
    .required()
    .messages({
      'string.base': 'Category should be a type of string',
      'string.empty': 'Category cannot be an empty field',
      'any.required': 'Category is required',
    }),

  subCategory: Joi.string()
    .required()
    .messages({
      'string.base': 'Subcategory should be a type of string',
      'string.empty': 'Subcategory cannot be an empty field',
      'any.required': 'Subcategory is required',
    }),

  brand: Joi.string()
    .required()
    .messages({
      'string.empty': 'Brand cannot be an empty field',
      'string.base': 'Brand should be a type of string',
      'any.required': 'Brand is required',
    }),

  stock: Joi.number()
    .min(1)
    .messages({
      'number.base': 'Stock should be a number',
      'number.min': 'Stock should be at least {#limit}',
      'any.required': 'Stock is a required field'
    })
});

//? Delete Product Schema 

export const deleteProductIdSchema = Joi.object({
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.base": "Category ID must be a string.",
      "string.empty": "Category ID cannot be empty.",
      "string.pattern.base": "Category ID must be a valid 24-character hexadecimal string.",
      "any.required": "Category ID is required."
    }),

  subCategory: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.base": "SubCategory ID must be a string.",
      "string.empty": "SubCategory ID cannot be empty.",
      "string.pattern.base": "SubCategory ID must be a valid 24-character hexadecimal string.",
      "any.required": "SubCategory ID is required."
    }),

  brand: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.base": "Brand ID must be a string.",
      "string.empty": "Brand ID cannot be empty.",
      "string.pattern.base": "Brand ID must be a valid 24-character hexadecimal string.",
      "any.required": "Brand ID is required."
    }),
});
