import { model, Schema } from "mongoose";

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  products: [{
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"]
    },
    quantity: { 
      type: Number, 
      required: [true, "Product quantity is required"],
      min: [1, "Quantity must be at least 1"]
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price must be a positive number"]
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative"]
  },
  totalPriceAfterDiscount: {
    type: Number,
    min: [0, "Total price after discount must be a positive number"]
  },
  address: {
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true
    },
    buildingNumber: {
      type: String,
      required: [true, "Building number is required"],
      trim: true
    },
    flatNumber: {
      type: String,
      required: [true, "Flat number is required"],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, "Zip code is required"],
      trim: true
    },
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment method is required"],
    enum: ["card", "cash"],
    default: "cash"
  },
  isPlaced: {
    type: Boolean,
    default: false
  },
  isShipped: {
    type: Boolean,
    default: false
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  isCanceled: {
    type: Boolean,
    default: false
  },
  canceledBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  coupon: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const Order = model("Order", orderSchema);
export default Order;
