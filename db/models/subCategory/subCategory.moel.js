import { model, Schema } from "mongoose";

const subCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Subcategory name must be at least 3 characters long'],
    maxlength: [50, 'Subcategory name cannot exceed 50 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    secure_url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'AddedBy (User) reference is required'],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, 'Category reference is required'],
  },
  customId: {
    type: String,
  },
}, {
  timestamps: true,
  versionKey: false,
});

subCategorySchema.index({ name: 1 });
subCategorySchema.index({ slug: 1 });

const SubCategory = model("SubCategory", subCategorySchema);
export default SubCategory;
