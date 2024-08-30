import { model, Schema } from "mongoose";

const orderReceiptSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Order ID is required"]
  },
  receiptPdfUrl: {
    type: String,
    required: [true, "Receipt PDF URL is required"]
  },
  status: {
    isDelivered: {
      type: Boolean,
      default: false
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment method is required"],
    enum: ["card", "cash"],
    default: "cash"
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

const OrderReceipt = model("OrderReceipt", orderReceiptSchema);

export default OrderReceipt;
