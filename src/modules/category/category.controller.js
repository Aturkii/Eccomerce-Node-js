import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import Category from './../../../db/models/category/category.model.js';
import { AppError } from './../../utils/errorClass.js';
import SubCategory from './../../../db/models/subCategory/subCategory.moel.js';
import Product from './../../../db/models/product/product.mode.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { apiFeatures } from './../../utils/apiFeatures.js';


//* =========================== Create Category =====================================

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const categoryExist = await Category.findOne({ name: name.toLowerCase() });
  if (categoryExist) {
    return next(new AppError('Category already exists.', 409));
  }

  if (!req.file) {
    return next(new AppError('Please upload a category image.', 400));
  }

  const customId = nanoid(5);
  const slug = slugify(name, { lower: true });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/Categories/${customId}`
    });

    const { secure_url, public_id } = result;

    const category = await Category.create({
      name,
      addedBy: req.user.id,
      slug,
      image: { secure_url, public_id },
      customId
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    return next(new AppError('Error uploading image to Cloudinary.', 500));
  }
});

//* =========================== Update Category =====================================

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  if (name === category.name) {
    return next(new AppError("Category name cannot be the same", 400));
  }

  const existingCategory = await Category.findOne({ name: name.toLowerCase() });
  if (existingCategory && existingCategory._id.toString() !== id) {
    return next(new AppError("Category already exists", 409));
  }

  if (req.file) {
    try {
      await cloudinary.uploader.destroy(category.image.public_id);

      const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Ecommerce/categories/${category.customId}`
      });

      category.image = { secure_url, public_id };
    } catch (error) {
      return next(new AppError("Failed to upload new image", 500));
    }
  }

  category.name = name;
  category.slug = slugify(name, { lower: true });

  await category.save();

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully',
    category
  });
});

//* =========================== Delete Category =====================================

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  try {
    await cloudinary.api.delete_resources_by_prefix(`Ecommerce/categories/${category.customId}`);
    await cloudinary.api.delete_folder(`Ecommerce/categories/${category.customId}`);
  } catch (error) {
    return next(new AppError("Failed to delete category resources from cloud storage", 500));
  }

  await Product.deleteMany({ category: id });
  await SubCategory.deleteMany({ category: category._id });
  await Category.deleteOne({ _id: category._id });

  return res.status(200).json({ status: "success", message: "Category deleted successfully" });
});

//* =========================== Get All Categories ==================================

export const getCategories = asyncHandler(async (req, res, next) => {
  const apiFeature = new apiFeatures(Category.find(), req.query)
    .filter()
    .select()
    .sort()
    .pagination()
    .search();

  const categories = await apiFeature.mongooseQuery;

  res.status(200).json({
    status: 'success',
    results: categories.length,
    categories,
  });
});

//* =========================== Get Specific Category ================================

export const getCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.params;

  if (!name) {
    return next(new AppError("Category name is required", 400));
  }

  const category = await Category.findOne({ name: name.toLowerCase() })
    .populate([
      {
        path: "subCategories",
        select: "name -_id -category"
      },
      {
        path: "addedBy",
        select: "firstName lastName -_id"
      }
    ]);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  return res.status(200).json({ category });
});
