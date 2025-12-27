import { CartModel } from "../models/Cart.model.js";

export const createCart = () => CartModel.create({ products: [] });

export const getCartPopulated = (cid) =>
  CartModel.findById(cid).populate("products.product").lean();

export const getCart = (cid) =>
  CartModel.findById(cid);

export const saveCart = (cart) => cart.save();
