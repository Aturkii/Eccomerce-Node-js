import Joi from 'joi';

//? Sign up validation schema
export const signUpSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 3 characters long',
    }),
  lastName: Joi.string()
    .min(3)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 3 characters long',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
  password: Joi.string()
    .min(6)
    .max(40)
    .pattern(/(?=.*[!#$%&?^*@~() "])(?=.{6,})/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 40 characters',
      'string.pattern.base': 'Password must contain at least one special character',
    }),
  repassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password must match repassword',
      'string.empty': 'Please confirm your password',
    }),
  age: Joi.number()
    .min(16)
    .required()
    .messages({
      'number.min': 'Age must be at least 16',
      'any.required': 'Age is required'
    }),
  role: Joi.string()
    .valid('user')
    .default('user')
    .messages({
      'string.empty': 'Role is required',
    }),
  phone: Joi.array()
    .items(
      Joi.string().pattern(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Please enter a valid phone number',
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one phone number is required',
      'array.includesRequiredUnknowns': 'Phone number is required',
    }),
  addresses: Joi.array()
    .items(
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
    )
    .min(1)
    .messages({
      'array.base': 'Addresses must be an array',
      'array.min': 'At least one address is required',
    }),
  gender: Joi.string()
    .valid('male', 'female')
    .required()
    .messages({
      'string.base': 'Gender must be a string',
      'string.empty': 'Gender is required',
      'any.only': 'Gender must be either "male" or "female"',
    }),
  birthDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Birth date must be a valid date',
      'any.required': 'Birth date is required',
    }),
});

//? Verify Email Schema
export const verifyEmailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be 6 characters long',
      'any.required': 'OTP is required',
    }),
});

//? Sign in validation schema 
export const signInSchema = Joi.object({
  emailOrPhone: Joi.alternatives()
    .try(
      Joi.string().email({ tlds: { allow: false } }).messages({
        'string.email': 'Please enter a valid email address',
      }),
      Joi.string().pattern(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Please enter a valid phone number',
      })
    )
    .required()
    .messages({
      'any.required': 'Email or Phone number is required',
      'alternatives.match': 'Please enter a valid email or phone number',
    }),
  password: Joi.string()
    .min(6)
    .max(40)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 40 characters',
    }),
});

//? Update user schama
export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .messages({
      'string.base': 'First name must be a text value',
      'string.min': 'First name must be at least 3 characters long',
      'string.empty': 'First name cannot be empty'
    }),

  lastName: Joi.string()
    .min(3)
    .messages({
      'string.base': 'Last name must be a text value',
      'string.min': 'Last name must be at least 3 characters long',
      'string.empty': 'Last name cannot be empty'
    }),

  phone: Joi.array()
    .items(
      Joi.string().pattern(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Please enter a valid phone number',
        'string.empty': 'Phone number cannot be empty'
      })
    )
    .min(1)
    .messages({
      'array.base': 'Phone must be an array of phone numbers',
      'array.includes': 'All phone numbers must be valid',
      'array.empty': 'Phone number array cannot be empty',
      'array.min': 'Phone array must contain at least one phone number'
    }),

  age: Joi.number()
    .min(16)
    .messages({
      'number.base': 'Age must be a number',
      'number.min': 'Age must be at least 16',
    }),

  addresses: Joi.array()
    .items(
      Joi.object({
        city: Joi.string()
          .messages({
            'string.base': 'City must be a string',
            'string.empty': 'City cannot be empty',
          }),
        state: Joi.string()
          .messages({
            'string.base': 'State must be a string',
            'string.empty': 'State cannot be empty',
          }),
        street: Joi.string()
          .messages({
            'string.base': 'Street must be a string',
            'string.empty': 'Street cannot be empty',
          }),
        buildingNumber: Joi.string()
          .messages({
            'string.base': 'Building number must be a string',
            'string.empty': 'Building number cannot be empty',
          }),
        flatNumber: Joi.string()
          .messages({
            'string.base': 'Flat number must be a string',
            'string.empty': 'Flat number cannot be empty',
          }),
        zipCode: Joi.string()
          .messages({
            'string.base': 'Zip code must be a string',
            'string.empty': 'Zip code cannot be empty',
          }),
      })
    )
    .min(1)
    .messages({
      'array.base': 'Addresses must be an array of address objects',
      'array.min': 'Addresses array must contain at least one address',
    }),

  gender: Joi.string()
    .valid('male', 'female')
    .messages({
      'string.base': 'Gender must be a string',
      'string.empty': 'Gender cannot be empty',
      'any.only': 'Gender must be either "male" or "female"',
    }),

  birthDate: Joi.date()
    .messages({
      'date.base': 'Birth date must be a valid date',
      'date.empty': 'Birth date cannot be empty',
    }),
})
  .or('firstName', 'lastName', 'phone', 'age', 'addresses', 'gender', 'birthDate')
  .messages({
    'object.missing': 'At least one field (firstName, lastName, phone, age, addresses, gender, or birthDate) must be provided for update'
  });

//? Email shcema
export const emailShcema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
})

//? Update Password schema 
export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .min(6)
    .max(40)
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'string.min': 'Current password must be at least 6 characters long',
      'string.max': 'Current password cannot exceed 40 characters',
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(40)
    .pattern(/(?=.*[!#$%&?^*@~() "])(?=.{6,})/)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 40 characters',
      'string.pattern.base': 'New password must contain at least one special character',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match the new password',
      'string.empty': 'Confirm password is required',
      'any.required': 'Confirm password is required'
    }),
});

//? Reset password 
export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  newPassword: Joi.string()
    .min(6)
    .max(40)
    .pattern(/(?=.*[!#$%&?^*@~() "])(?=.{6,})/)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 40 characters',
      'string.pattern.base': 'New password must contain at least one special character',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
      'string.empty': 'Confirm password is required',
    }),
  otp: Joi.string()
    .length(6)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be 6 characters long',
      'any.required': 'OTP is required',
    }),
});
