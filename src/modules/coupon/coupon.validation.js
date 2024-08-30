import Joi from 'joi';

//? Create Coupon Schema
export const createCouponSchema = Joi.object({
  code: Joi.string()
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

  amount: Joi.number()
    .min(1)
    .max(100)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount must be at least 1',
      'number.max': 'Amount must not exceed 100',
      'any.required': 'Amount is required',
      'string.empty': 'Amount code is required',
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required',
      'string.empty': 'Start code is required',

    }),

  endDate: Joi.date()
    .required()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after the start date',
      'any.required': 'End date is required',
      'string.empty': 'End code is required',
    })
});

//? Create Coupon Schema
export const updateCouponSchema = Joi.object({
  code: Joi.string()
    .min(3)
    .max(20)
    .lowercase()
    .trim()
    .messages({
      'string.base': 'Coupon code must be a string',
      'string.empty': 'Coupon code is required',
      'string.min': 'Coupon code must be at least 3 characters long',
      'string.max': 'Coupon code must not exceed 20 characters',
      'any.required': 'Coupon code is required'
    }),

  amount: Joi.number()
    .min(1)
    .max(100)
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount must be at least 1',
      'string.empty': 'Amount code is required',
      'number.max': 'Amount must not exceed 100',
      'any.required': 'Amount is required'
    }),

  startDate: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date',
      'string.empty': 'Start code is required',
      'any.required': 'Start date is required'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'string.empty': 'End code is required',
      'date.greater': 'End date must be after the start date',
      'any.required': 'End date is required'
    })
});
