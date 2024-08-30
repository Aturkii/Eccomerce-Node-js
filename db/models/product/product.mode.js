import { model, Schema } from "mongoose";

const productSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    unique: true,
    minLength: [3, 'Product title must be at least 3 characters long'],
    maxLength: [60, 'Product title cannot exceed 60 characters'],
    lowercase: true
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    trim: true,
    unique: true,
    lowercase: true,
    minLength: [3, 'Product slug must be at least 3 characters long'],
    maxLength: [80, 'Product slug cannot exceed 80 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minLength: [10, 'Product description must be at least 10 characters long'],
    maxLength: [900, 'Product description cannot exceed 900 characters']
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who added the product is required']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: [true, 'Subcategory is required']
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    default: 1,
    min: [1, 'Product price must be at least 1']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be less than 0'],
    max: [100, 'Discount cannot exceed 100']
  },
  subPrice: {
    type: Number,
    default: 0,
    min: [0, 'Subprice cannot be less than 0']
  },
  stock: {
    type: Number,
    default: 1,
    min: [1, 'Stock must be at least 1']
  },
  customId: {
    type: String,
    unique: true,
    sparse: true
  },
  rateAvg: {
    type: Number,
    default: 0,
    min: [0, 'Average rating cannot be less than 0'],
    max: [5, 'Average rating cannot exceed 5']
  },
  rateNum: {
    type: Number,
    default: 0,
    min: [0, 'Number of ratings cannot be less than 0']
  },
  image: {
    secure_url: {
      type: String
    },
    public_id: {
      type: String
    }
  },
  coverImages: [{
    secure_url: String,
    public_id: String
  }]
}, {
  timestamps: true,
  versionKey: false
});

const Product = model("Product", productSchema);

export default Product;
