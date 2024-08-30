import { model, Schema } from "mongoose";

const cartSchema = new Schema({
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
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price must be a positive number"]
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price must be a positive number"]
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be less than 0"],
    max: [100, "Discount cannot be more than 100"]
  },
  totalPriceAfterDiscount: {
    type: Number,
    min: [0, "Total price after discount must be a positive number"]
  },
  coupon: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const Cart = model("Cart", cartSchema);
export default Cart;
