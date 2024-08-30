import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloudinary.js";
import { AppError } from "../../utils/errorClass.js";
import slugify from "slugify";
import Product from './../../../db/models/product/product.mode.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import SubCategory from './../../../db/models/subCategory/subCategory.moel.js';
import Category from './../../../db/models/category/category.model.js';
import { apiFeatures } from './../../utils/apiFeatures.js';


//* ___________________________ Create subCategory _____________________________________

export const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new AppError(`Category with ID '${id}' not found`, 404));
  }

  const existingSubCategory = await SubCategory.findOne({ name: name.toLowerCase() });
  if (existingSubCategory) {
    return next(new AppError(`Subcategory with name '${name}' already exists`, 409));
  }

  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const customId = nanoid(5);
  let secure_url, public_id;
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/categories/${category.customId}/subCategories/${customId}`
    });
    secure_url = result.secure_url;
    public_id = result.public_id;
  } catch (error) {
    return next(new AppError("Failed to upload image", 500));
  }

  const slug = slugify(name, { lower: true });
  const newSubCategory = await SubCategory.create({
    name: name.toLowerCase(),
    slug,
    category: category._id,
    addedBy: req.user.id,
    customId,
    image: { secure_url, public_id }
  });

  res.status(201).json({
    status: 'success',
    message: 'Subcategory created successfully',
    subCategory: newSubCategory
  });
});

//* ___________________________ Update subCategory _____________________________________

export const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subCategoryId } = req.params;
  const { name } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  if (category._id.toString() !== subCategory.category.toString()) {
    return next(new AppError("Subcategory does not belong to this category", 400));
  }

  if (subCategory.name.toLowerCase() === name.toLowerCase()) {
    return next(new AppError("No changes detected in the subcategory name", 400));
  }
  const existingSubCategory = await SubCategory.findOne({ name: name.toLowerCase() });
  if (existingSubCategory && existingSubCategory._id.toString() !== subCategoryId) {
    return next(new AppError("Subcategory with this name already exists", 400));
  }

  if (req.file) {
    try {
      await cloudinary.uploader.destroy(subCategory.image.public_id);
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}`
      });
      subCategory.image = { secure_url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      return next(new AppError("Failed to upload new image", 500));
    }
  }

  subCategory.name = name.toLowerCase();
  subCategory.slug = slugify(name, { lower: true });
  await subCategory.save();

  res.status(200).json({
    status: 'success',
    message: 'Subcategory updated successfully',
    subCategory
  });
});

//* ___________________________ Delete subCategory _____________________________________

export const deleteSubcategories = asyncHandler(async (req, res, next) => {
  const { categoryId, subCategoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  if (!subCategory.category.equals(category._id)) {
    return next(new AppError("Subcategory does not belong to this category", 400));
  }

  const folderPath = `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}`;

  console.log(`Attempting to delete resources at path: ${folderPath}`);

  try {
    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath
    });

    console.log('Resources found:', resources);

    if (resources.length > 0) {
      const deleteResourcesResponse = await cloudinary.api.delete_resources_by_prefix(folderPath);
      console.log('Cloudinary delete_resources_by_prefix response:', deleteResourcesResponse);

      if (deleteResourcesResponse.deleted_counts === 0) {
        console.log('No resources were deleted.');
      }
    } else {
      console.log('No resources found at the specified path.');
    }

    if (resources.length > 0) {
      await cloudinary.api.delete_folder(folderPath);
      console.log(`Folder ${folderPath} deleted successfully.`);
    }
  } catch (cloudinaryError) {
    console.error('Failed to delete resources from Cloudinary:', cloudinaryError.message);
    return next(new AppError("Failed to delete image from Cloudinary", 500));
  }

  try {
    await Product.deleteMany({ subCategory: subCategoryId });
  } catch (error) {
    console.error('Failed to delete products:', error.message);
    return next(new AppError("Failed to delete products associated with this subcategory", 500));
  }

  try {
    await SubCategory.deleteOne({ _id: subCategory._id });
  } catch (error) {
    console.error('Failed to delete subcategory:', error.message);
    return next(new AppError("Failed to delete subcategory", 500));
  }

  return res.status(200).json({ message: "Subcategory deleted successfully" });
});

//* ___________________________ Get all  SubCategory _____________________________________

export const getSubCategories = asyncHandler(async (req, res, next) => {
  const apiFeature = new apiFeatures(SubCategory.find(), req.query)
    .filter()
    .select()
    .sort()
    .pagination()
    .search();

  try {
    const subcategories = await apiFeature.mongooseQuery;

    if (!subcategories.length) {
      return next(new AppError("No subcategories found", 404));
    }

    return res.status(200).json({
      status: 'success',
      results: subcategories.length,
      data: subcategories
    });
  } catch (error) {
    return next(new AppError("Failed to retrieve subcategories", 500));
  }
});


//* ___________________________ get specific subCategory _____________________________________

export const getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findById(id)
    .populate({
      path: "category",
      select: "name -_id"
    })
    .populate({
      path: "addedBy",
      select: "firstName lastName -_id"
    });

  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  return res.status(200).json(subCategory);
});
