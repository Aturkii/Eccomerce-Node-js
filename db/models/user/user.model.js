import mongoose from 'mongoose';
import role from '../../../src/utils/systemRoles.js';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [3, 'First name must be at least 3 characters long'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [3, 'Last name must be at least 3 characters long'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already exists'],
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    trim: true
  },
  phone: [{
    type: String,
    match: [/^01[0125][0-9]{8}$/, 'Please enter a valid phone number'],
    trim: true
  }],
  password: {
    type: String,
    required: [true, 'Password is required'],
    match: [/(?=.*[!#$%&?^*@~() "])(?=.{6,})/, 'Password must contain at least one special character'],
  },
  role: {
    type: String,
    default: role.user,
  },
  addresses: [{
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,

    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
    },
    buildingNumber: {
      type: String,
      required: [true, "Building number is required"],
      trim: true,
    },
    flatNumber: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, "Zip is required"],
      trim: true,
    },
  }],
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: ["male", "female"],
    Lowercase: true
  },
  birthDate: {
    type: Date,
    required: [true, "Birth day is required"],

  },
  age: {
    type: Number,
    min: [16, 'Age cant be less than 16'],
    required: [true, 'Age is required'],
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpire: {
    type: Date,
    default: null,
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  online: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

const User = mongoose.model('User', userSchema);

export default User;
