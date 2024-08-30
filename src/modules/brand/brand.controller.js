import Brand from "../../../db/models/brand/brand.model.js"
import cloudinary from './../../utils/cloudinary.js';
import Product from './../../../db/models/product/product.mode.js';
import { apiFeatures } from './../../utils/apiFeatures.js';
import { asyncHandler } from './../../utils/asyncHandler.js';
import { AppError } from './../../utils/errorClass.js';
import { nanoid } from "nanoid";
import SubCategory from './../../../db/models/subCategory/subCategory.moel.js';
import slugify from "slugify";
import Category from "../../../db/models/category/category.model.js";


//* _________________________________ Create Brand ______________________________________

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { subCategoryId, categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const subCategory = await SubCategory.findById(subCategoryId);

  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  const brandExist = await Brand.findOne({ name: name.toLowerCase() });
  if (brandExist) {
    return next(new AppError("Brand already exists", 400));
  }

  if (!req.file) {
    return next(new AppError("Please upload a logo", 400));
  }

  const customId = nanoid(5);
  let secure_url, public_id;

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${customId}`
    });
    secure_url = result.secure_url;
    public_id = result.public_id;
  } catch (error) {
    return next(new AppError("Failed to upload logo to Cloudinary", 500));
  }

  const slug = slugify(name, { lower: true });

  let brand;
  try {
    brand = await Brand.create({
      name: name.toLowerCase(),
      slug,
      addedBy: req.user.id,
      image: { secure_url, public_id },
      customId,
      subCategory: subCategoryId
    });
  } catch (error) {
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }
    return next(new AppError("Failed to create brand", 500));
  }

  return res.status(201).json({
    message: "Brand created successfully",
    brand
  });
});

//* _________________________________ Update Brand ______________________________________

export const updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, subCategoryId, categoryId } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("category not found", 404));
  }

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("subcategory not found", 404));
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  if (name) {
    const existingBrand = await Brand.findOne({ name: name.toLowerCase() });
    if (existingBrand && existingBrand._id.toString() !== id.toString()) {
      return next(new AppError("Brand already exists", 400));
    }
    brand.name = name;
    brand.slug = slugify(name, { lower: true });
  }

  if (req.file) {
    try {
      if (brand.image && brand.image.public_id) {
        await cloudinary.uploader.destroy(brand.image.public_id);
      }

      const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${brand.customId}`
      });

      brand.image = { secure_url, public_id };
    } catch (error) {
      return next(new AppError("Failed to upload image to Cloudinary", 500));
    }
  }

  if (subCategoryId) {
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return next(new AppError("Subcategory not found", 404));
    }
    brand.subCategory = subCategoryId;
  }

  await brand.save();
  return res.status(200).json({
    message: "Brand updated successfully",
    brand
  });
});

//* _________________________________ Delete Brand ______________________________________

export const deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { subCategoryId, categoryId } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("category not found", 404));
  }

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("subcategory not found", 404));
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  const products = await Product.find({ brand: id });

  for (const product of products) {
    if (product.image && product.image.public_id) {
      const lastSlashIndex = product.image.public_id.lastIndexOf('/');
      const folderPath = product.image.public_id.substring(0, lastSlashIndex);

      try {
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);
      } catch (error) {
        return next(new AppError("Failed to delete product images from Cloudinary", 500));
      }
    }
  }

  await Product.deleteMany({ brand: id });

  try {
    if (brand.image && brand.image.public_id) {
      await cloudinary.uploader.destroy(brand.image.public_id);
    }

    await cloudinary.api.delete_resources_by_prefix(`Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${brand.customId}`);

    await cloudinary.api.delete_folder(`Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/brands/${brand.customId}`);

  } catch (error) {
    return next(new AppError("Failed to delete brand images from Cloudinary", 500));
  }

  await Brand.deleteOne({ _id: id });

  return res.status(200).json({ message: "Brand deleted successfully" });
});

//* _________________________________ Get All Brands ____________________________________

export const getBrands = asyncHandler(async (req, res, next) => {
  try {
    const apiFeature = new apiFeatures(Brand.find(), req.query)
      .filter()
      .search()
      .select()
      .sort()
      .pagination();

    const brands = await apiFeature.mongooseQuery;

    const totalCount = await Brand.countDocuments(apiFeature.query);

    return res.status(200).json({
      status: 'success',
      results: brands.length,
      total: totalCount,
      brands
    });
  } catch (error) {
    return next(new AppError('Failed to retrieve brands', 500));
  }
});

//* _________________________________ Get Specific Brand _________________________________

export const getSpecificBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await Brand.findById(id).populate({
    path: 'addedBy',
    select: 'firstName lastName -_id',
  });

  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    brand,
  });
});