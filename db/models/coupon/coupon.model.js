import { model, Schema } from "mongoose";

const couponSchema = new Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    trim: true,
    minlength: [3, "Coupon code must be at least 3 characters long"],
    maxlength: [20, "Coupon code must be less than 20 characters long"],
    lowercase: true
  },
  amount: {
    type: Number,
    required: [true, "Discount amount is required"],
    min: [1, "Discount amount must be at least 1%"],
    max: [100, "Discount amount cannot exceed 100%"],
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Start date must be in the future"
    }
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  usedBy: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true,
  versionKey: false
});

const Coupon = model("Coupon", couponSchema);
export default Coupon;
