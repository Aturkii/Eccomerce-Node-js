import Joi from "joi";

//? Id validation schema
export const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': `"id" must be a valid 24-character hexadecimal string`,
    'string.empty': `"id" cannot be an empty field`,
    'any.required': `"id" is a required field`
  })
});