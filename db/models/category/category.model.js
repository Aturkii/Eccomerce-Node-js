import { model, Schema } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Category name must be at least 3 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters'],
    lowercase: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    minlength: [3, 'Slug must be at least 3 characters long'],
    maxlength: [50, 'Slug cannot exceed 50 characters'],
    trim: true,
    lowercase: true
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  image: {
    secure_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    public_id: {
      type: String,
      required: [true, 'Public ID is required'],
    }
  },
  customId: {
    type: String,
    required: [true, 'Custom ID is required'],
    unique: true,
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual("subCategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category",
  justOne: false
});

const Category = model("Category", categorySchema);

export default Category;
  