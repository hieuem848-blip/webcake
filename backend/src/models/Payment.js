import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: String,
    amount: Number,
    status: String,
    transactionCode: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
