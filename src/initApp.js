import * as routers from './modules/index.routes.js'
import { connectDB } from "../db/connection.js";
import dotenv from 'dotenv';
import { globalHandler } from './utils/globalErrorHandler.js';
import { AppError } from './utils/errorClass.js';
import cors from "cors"
import { deleteFromDb } from './utils/deleteFromDB.js';
import { deleteFromCloudinary } from './utils/deleteFromCloudinary.js';

dotenv.config();

export const initApp = (app, express) => {

  app.use((req, res, next) => {
    if (req.originalUrl === '/orders/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  const port = process.env.PORT || 3001

  app.use(express.json())

  app.use(cors())

  app.get('/', (req, res, next) => {
    res.status(400).json('Welcome To our Ecommerce website')
  })

  app.use('/users', routers.userRouter)
  app.use('/cart', routers.cartRouter)
  app.use('/categories', routers.categoryRouter)
  app.use('/coupon', routers.couponRouter)
  app.use('/orders', routers.orderRouter)
  app.use('/products', routers.productRouter)
  app.use('/reviews', routers.reviewRouter)
  app.use('/subCategories', routers.subCategoryRouter)
  app.use('/wishlist', routers.wishlistRouter)
  app.use('/admin', routers.adminRouter)
  app.use('/brands', routers.brandRouter)
  app.use('*', (req, res, next) => {
    res.status(400).json('Invalid URL')
  })


  connectDB()


  app.use(globalHandler, deleteFromCloudinary, deleteFromDb)

  app.listen(port, () => {
    console.log(`Server is running`);
  })

}