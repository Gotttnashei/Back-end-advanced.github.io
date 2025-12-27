import { ProductModel } from "../models/Product.model.js";

export const paginateProducts = (filter, options) =>
  ProductModel.paginate(filter, options);

export const getProductById = (id) =>
  ProductModel.findById(id).lean();

export const createProduct = (data) =>
  ProductModel.create(data);
