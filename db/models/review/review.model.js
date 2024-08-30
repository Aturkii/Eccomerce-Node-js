import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [3, 'Comment must be at least 3 characters long']
    },
    rate: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    }
}, {
    timestamps: true,
    versionKey: false
});

const Reviews = model("Review", reviewSchema);

export default Reviews;
