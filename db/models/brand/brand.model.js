import { model, Schema } from "mongoose";

const brandSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [3, 'Brand name must be at least 3 characters long'],
    maxLength: [30, 'Brand name must be less than 30 characters long']
  },
  slug: {
    type: String,
    required: [true, 'Brand slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  image: {
    secure_url: {
      type: String,
      default: ''
    },
    public_id: {
      type: String,
      default: ''
    }
  },
  customId: {
    type: String,
    unique: true,
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User who added the brand is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });

const Brand = model("Brand", brandSchema);
export default Brand;
