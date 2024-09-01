# eCommerce Application

## Overview

This eCommerce application is a robust, full-featured platform designed to handle various aspects of online shopping, including user management, product handling, order processing, and more. Built with a focus on solid architecture, extensive error handling, and a well-defined role-based access system, the application provides a seamless shopping experience and administrative capabilities.

## Features

### User Management
- **User Registration & Authentication**: Secure user registration and login using JWT tokens. Email verification and password resets are handled via nodemailer.
- **Admin Management**: Admins can manage user roles, view applications, and handle approvals/rejections. Admin actions are logged for audit purposes.
- **User Deletion**: Users can be deleted, and associated data (categories, brands, products, wishlists, carts, and reviews) are also removed.

### Product Management
- **CRUD Operations**: Full management of products, categories, and subcategories.
- **Stock Management**: Automatic stock updates based on user actions (orders and cancellations).
- **Brands & Coupons**: Manage product brands and apply coupons.

### Order Management
- **Order Creation & Processing**: Users can place orders, which are processed and tracked. Payment integration with Stripe.
- **Order Cancellation**: Users can cancel orders under specific conditions. Stock and coupon usage are updated accordingly.
- **Order Receipts**: Generate and manage invoices. Invoices are stored in Cloudinary and referenced in the database for tax and accounting purposes.

### Notifications
- **Email Notifications**: Notifications for user registration, OTPs, password resets, and order details with attached invoices.

### Validation & Error Handling
- **Validation**: Comprehensive validation using Joi for all incoming data (body, params, query).
- **Error Handling**: Robust error handling across the application using custom error classes and middleware.

### Role-Based Access Control
- **System Roles**: Defined roles for users, admins, and other system roles with specific permissions.

### API Features
- **Pagination & Filtering**: APIs support pagination and filtering for managing large datasets like orders and receipts.
- **Webhook Integration**: Stripe webhooks handle payment events and order processing.

### Architectural Design
- **SOLID Principles**: The application follows SOLID principles to ensure a clean, maintainable, and scalable codebase.
- **Separation of Concerns**: Initialization code is separated into `initApp.js`, keeping `index.js` focused on application startup.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose for ORM)
- **Authentication**: JWT
- **Payment Gateway**: Stripe
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Validation**: Joi
- **File Handling**: Multer
- **Utilities**: Nanoid for unique IDs, PDFKit for generating invoices

## Live Demo

Check out the live demo of the application: [Live Demo](https://eccomerce-node-js.vercel.app/)

