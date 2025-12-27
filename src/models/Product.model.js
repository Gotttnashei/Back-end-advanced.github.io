const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    code: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true, index: true },
    status: { type: Boolean, default: true, index: true },
    stock: { type: Number, default: 0, index: true },
    category: { type: String, default: "", index: true },
    thumbnails: { type: [String], default: [] }
  },
  { timestamps: true }
);

//  esto agrega ProductModel.paginate(...)
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Products", productSchema);
