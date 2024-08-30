import { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.DB_ONLINE_URL;

export const connectDB = async () => {
  try {
    await connect(mongoURI);
    console.log('Connected to database successfully');
  } catch (error) {
    console.log('Error connecting to database:', error);
  }
};
