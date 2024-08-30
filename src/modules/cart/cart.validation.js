import Joi from 'joi';

//? add To Cart Schema
export const addToCartSchema = Joi.object({
  product: Joi.string()
    .length(24)
    .hex()
    .required()
    .messages({
      'string.base': 'Product ID must be a string',
      'string.length': 'Product ID must be 24 characters long',
      'string.hex': 'Product ID must be a valid hexadecimal string',
      'any.required': 'Product ID is required'
    }),
  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.positive': 'Quantity must be a positive number',
      'any.required': 'Quantity is required'
    })
});

//? Update Cart quantity
export const quantity = Joi.object({
  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.positive': 'Quantity must be a positive number',
      'any.required': 'Quantity is required'
    })
});

//? Apply coupon
export const coupon = Joi.object({
  coupon: Joi.string()
    .min(3)
    .max(20)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.base': 'Coupon code must be a string',
      'string.empty': 'Coupon code is required',
      'string.min': 'Coupon code must be at least 3 characters long',
      'string.max': 'Coupon code must not exceed 20 characters',
      'any.required': 'Coupon code is required'
    }),
})