import Joi from "joi";

export const productId = Joi.object({
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"productId" must be a valid 24-character hexadecimal string`,
    'string.empty': `"productId" cannot be an empty field`,
    'any.required': `"productId" is a required field`
  })
});