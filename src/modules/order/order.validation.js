import Joi from 'joi';

//? schema for the address
export const addressSchema = Joi.object({
  address:
    Joi.object({
      city: Joi.string()
        .required()
        .messages({
          'string.base': 'City must be a string',
          'string.empty': 'City is required',
        }),
      state: Joi.string()
        .required()
        .messages({
          'string.base': 'State must be a string',
          'string.empty': 'State is required',
        }),
      street: Joi.string()
        .required()
        .messages({
          'string.base': 'Street must be a string',
          'string.empty': 'Street is required',
        }),
      buildingNumber: Joi.string()
        .required()
        .messages({
          'string.base': 'Building number must be a string',
          'string.empty': 'Building number is required',
        }),
      flatNumber: Joi.string()
        .required()
        .messages({
          'string.base': 'Flat number must be a string',
          'string.empty': 'Flat number is required',
        }),
      zipCode: Joi.string()
        .required()
        .messages({
          'string.base': 'Zip code must be a string',
          'string.empty': 'Zip code is required',
        }),
    })
});
