import { Schema, model } from "mongoose";

const wishListSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User ID is required"]
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, "Product ID is required"]
  }]
}, {
  timestamps: true,
  versionKey: false
});

const WishList = model("WishList", wishListSchema);
export default WishList;
