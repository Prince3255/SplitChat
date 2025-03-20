import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    paidBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment