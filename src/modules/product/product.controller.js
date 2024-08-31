import slugify from "slugify";
import cloudinary from "../../utils/cloudinary.js";
import { AppError } from "../../utils/errorClass.js";
import { nanoid } from "nanoid";
import { apiFeatures } from "../../utils/apiFeatures.js";
import { asyncHandler } from './../../utils/asyncHandler.js';
import SubCategory from './../../../db/models/subCategory/subCategory.moel.js';
import Category from './../../../db/models/category/category.model.js';
import Brand from './../../../db/models/brand/brand.model.js';
import Product from './../../../db/models/product/product.mode.js';
import Reviews from "../../../db/models/review/review.model.js";


//* ============================== Create Product ======================================

export const addProduct = asyncHandler(async (req, res, next) => {
  const { title,
    description,
    price,
    discount,
    category,
    subCategory,
    brand,
    stock } = req.body

  const categoryExist = await Category.findById(category)

  if (!categoryExist) {
    return next(new AppError("Category not found", 404))
  }

  const subCategoryExist = await SubCategory.findOne({ _id: subCategory, category })
  if (!subCategoryExist) {
    return next(new AppError("Sub Category not found", 404))
  }

  const brandExist = await Brand.findById(brand)

  if (!brandExist) {
    return next(new AppError("Brand not found", 404))
  }

  const subPrice = price - (price * (discount || 0) / 100)

  if (!req.files) {
    return next(new AppError("Please add product image and cover images", 404))
  }
  const customId = nanoid(5)

  const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
    folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${customId}/mainImage`
  })

  const list = []

  for (const file of req.files.coverImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
      folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${customId}/coverImages`,

    })

    list.push({ secure_url, public_id })
  }
  req.filePath = `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/products/${customId}`
  const slug = slugify(title, {
    lower: true
  })
  const product = await Product.create({
    title,
    description,
    price,
    stock,
    category,
    brand,
    subCategory,
    image: { secure_url, public_id },
    coverImages: list,
    customId,
    subPrice,
    discount,
    slug,
    addedBy: req.user.id
  })

  req.data = {
    model: Product,
    id: product._id
  }

  return res.status(201).json({
    status: "success",
    message: "Product added successfully",
    product
  })
})

//* ============================== Update Product =======================================

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price, discount, category, subCategory, brand, stock } = req.body;

  const categoryExist = await Category.findById(category);

  if (!categoryExist) {
    return next(new AppError("Category not found", 404));
  }

  const subCategoryExist = await SubCategory.findOne({ _id: subCategory, category });
  if (!subCategoryExist) {
    return next(new AppError("Sub Category not found", 404));
  }

  const brandExist = await Brand.findById(brand);
  if (!brandExist) {
    return next(new AppError("Brand not found", 404));
  }

  const product = await Product.findOne({ _id: id, addedBy: req.user.id });
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  if (title) {
    const newTitle = title.toLowerCase();
    if (product.title === newTitle) {
      return next(new AppError("Product title matches the old title", 409));
    }
    if (await Product.findOne({ title: newTitle })) {
      return next(new AppError("Product title already exists", 409));
    }
    product.title = newTitle;
    product.slug = slugify(title, { lower: true });
  }

  if (description) product.description = description;
  if (stock) product.stock = stock;

  if (price) {
    product.price = price;
    product.subPrice = price - (price * ((discount || product.discount) / 100));
  }

  if (discount) {
    product.discount = discount;
    product.subPrice = product.price - (product.price * (discount / 100));
  }

  if (req.files) {
    if (req.files?.image?.length > 0) {
      await cloudinary.uploader.destroy(product.image.public_id);
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${product.customId}/mainImage`
      });
      product.image = { secure_url, public_id };
    }

    if (req.files.coverImages?.length > 0) {
      await cloudinary.api.delete_resources_by_prefix(`Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${product.customId}/coverImages`);

      const coverImages = await Promise.all(req.files.coverImages.map(async (file) => {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
          folder: `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${product.customId}/coverImages`,
        });
        return { secure_url, public_id };
      }));

      product.coverImages = coverImages;
    }
  }

  await product.save();

  return res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    product,
  });
});

//* ============================== Delete Product =======================================

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const { category, subCategory, brand } = req.body;
  const { id } = req.params;

  try {
    const categoryExist = await Category.findById(category);
    if (!categoryExist) {
      return next(new AppError("Category not found", 404));
    }

    const subCategoryExist = await SubCategory.findOne({ _id: subCategory, category });
    if (!subCategoryExist) {
      return next(new AppError("Sub Category not found", 404));
    }

    const brandExist = await Brand.findById(brand);
    if (!brandExist) {
      return next(new AppError("Brand not found", 404));
    }

    const product = await Product.findOne({ _id: id, addedBy: req.user.id });
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const productFolder = `Ecommerce/categories/${categoryExist.customId}/subCategories/${subCategoryExist.customId}/brands/${brandExist.customId}/products/${product.customId}`;

    await cloudinary.api.delete_resources_by_prefix(productFolder);
    await cloudinary.api.delete_folder(productFolder);

    await Product.deleteOne({ _id: id });
    await Reviews.deleteMany({ product: id })
    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully"
    });
  } catch (error) {
    return next(new AppError("Failed to delete product", 500));
  }
});

//* ============================== Get all Products =====================================

export const getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    const apiFeature = new apiFeatures(Product.find(), req.query)
      .search()
      .select()
      .pagination()
      .filter()
      .sort();

    const products = await apiFeature.mongooseQuery
      .populate({
        path: 'category',
        select: 'name -_id',
      })
      .populate({
        path: 'subCategory',
        select: 'name -_id',
      })
      .populate({
        path: 'brand',
        select: 'name -_id',
      })
      .populate({
        path: 'addedBy',
        select: 'firstName lastName -_id',
      });;

    return res.status(200).json({
      status: 'success',
      products,
    });
  } catch (error) {
    return next(new AppError('Failed to fetch products', 500));
  }
});

//* ============================== Get Specific Product =================================

export const getSpecificProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate({
        path: 'category',
        select: 'name -_id',
      })
      .populate({
        path: 'subCategory',
        select: 'name -_id',
      })
      .populate({
        path: 'brand',
        select: 'name -_id',
      })
      .populate({
        path: 'addedBy',
        select: 'firstName lastName -_id',
      });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Respond with the product details
    return res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    // Handle any unexpected errors
    return next(new AppError('Failed to fetch product', 500));
  }
});
