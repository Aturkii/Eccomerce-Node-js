import Joi from 'joi';

//~ schema for validating reviews
export const reviewSchema = Joi.object({
    comment: Joi.string()
        .trim()
        .min(3)
        .required()
        .messages({
            'string.base': 'Comment must be a string',
            'string.empty': 'Comment is required',
            'string.min': 'Comment must be at least 3 characters long',
        }),
    rate: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.integer': 'Rating must be an integer',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
        }),
});

//~ reviewId 
export const removeReviewSchema = Joi.object({
    reviewId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': `"reviewId" must be a valid 24-character hexadecimal string`,
        'string.empty': `"reviewId" cannot be an empty field`,
        'any.required': `"reviewId" is a required field`
    }),
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': `"productId" must be a valid 24-character hexadecimal string`,
        'string.empty': `"productId" cannot be an empty field`,
        'any.required': `"productId" is a required field`
    }),
});