import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
});

const PropertySchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceInETH: {
      type: Number,
      required: true,
    },
    owner: {
      type: String,
      required: true, // Wallet address of current owner (0x742d…)
    },
    email: {
      type: String,
      required: true,
    },
    blockchainTx: {
      type: String,
      required: true, // Transaction hash from blockchain
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    listedAt: {
      type: Date,
      default: Date.now,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    previousOwner: {
      type: String,
      default: null, // Stores previous owner when property is sold
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

export const User = mongoose.model("regis", UserSchema);
export const Property = mongoose.model("Propertiesbc", PropertySchema);
