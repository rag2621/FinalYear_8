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

    amenities: [
      {
        type: String,
        enum: ["school", "hospital", "peaceful", "luxury", "metro", "mall"],
      },
    ],

    owner: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    blockchainTx: {
      type: String,
      required: true,
    },

    // ✅ NEW: Blockchain property ID
    blockchainPropertyId: {
      type: String,
      default: null,
    },

    contractAddress: {
      type: String,
      default: null,
    },

    network: {
      type: String,
      default: null,
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
export const User = mongoose.model("regis", UserSchema);
export const Property = mongoose.model("Propertiesbc", PropertySchema);
