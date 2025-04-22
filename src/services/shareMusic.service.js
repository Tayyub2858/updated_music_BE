const httpStatus = require('http-status');
const { ShareMusicAsset, ShareMusicCreation, Cart, Sale } = require('../models');
const ApiError = require('../utils/ApiError');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');


/**
 * Create a music asset
 * @param {Object} body
 * @returns {Promise<Job>}
 */
const shareAsset = async (body) => {
  return ShareMusicAsset.create(body);
};

/**
 * Get Music Assets by userId
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getAssets = async (createdBy) => {
  return ShareMusicAsset.find({ createdBy });
};

const getAssetsById = async (id) => {
  const data = await ShareMusicAsset.findById(id);
  return data;
};

const getAllAssets = async () => {
  const assets = await ShareMusicAsset.find()
    .limit(30)
    .sort({ createdAt: -1 });
  return assets;
};

/**
 * Create a music creation
 * @param {Object} body
 * @returns {Promise<Job>}
 */
const shareCreation = async (body) => {
  return ShareMusicCreation.create(body);
};

/**
 * Get Music Assets by userId
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getCreation = async (createdBy) => {
  return ShareMusicCreation.find({ createdBy });
};

const getCreationById = async (id) => {
  return ShareMusicCreation.findById(id);
};

const addToCart = async (userId, assetId) => {
  try {
    let cart = await Cart.findOne({ createdBy: userId });

    if (!cart) {
      cart = new Cart({
        createdBy: userId,
        cartItems: [{ assetId, quantity: 1 }]
      });
    } else {
      const existingItem = cart.cartItems.find(item => item.assetId.toString() === assetId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.cartItems.push({ assetId, quantity: 1 });
      }
    }

    await cart.save();

    let CartData = await Cart.findById(cart._id)
      .populate({
        path: 'cartItems.assetId',
        select: 'songName commercialUsePrice musicImage ',
      });

    const creatorName = await ShareMusicAsset.findById(assetId)
      .populate({
        path: 'createdBy',
        select: 'name'
      })

    const data = CartData.cartItems.map((item) => ({
      ...item.toObject(),
      assetId: {
        ...item.assetId.toObject(),
        creatorName: creatorName.createdBy.name,
        ownerId: creatorName.createdBy.id || creatorName.createdBy._id
      }
    }))

    // console.log(data, 'data')

    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Could not add asset to cart");
  }
};



const getCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ createdBy: userId })

    if (!cart) {
      return { success: false, message: "Cart is empty", cart: [] };
    }
    let CartData = await Cart.findById(cart._id)
      .populate({
        path: 'cartItems.assetId',
        select: 'songName commercialUsePrice musicImage ',
      });

    const creatorName = await ShareMusicAsset.findById(cart.cartItems.map(item => item.assetId))
      .populate({
        path: 'createdBy',
        select: 'name'
      })

    const data = CartData.cartItems.map((item) => ({
      ...item.toObject(),
      assetId: {
        ...item.assetId.toObject(),
        creatorName: creatorName.createdBy.name,
        ownerId: creatorName.createdBy.id || creatorName.createdBy._id
      }
    }))

    // console.log(data, 'data')


    if (!cart) {
      return { success: false, message: "Cart is empty", cart: [] };
    }

    return data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Could not retrieve cart");
  }
};



const deleteCart = async (userId, assetId) => {
  try {
    const cart = await Cart.findOne({ createdBy: userId });

    if (!cart) {
      return { success: false, message: "Cart not found" };
    }

    // Remove the specific item from cartItems array
    cart.cartItems = cart.cartItems.filter(
      item => item.assetId.toString() !== assetId
    );

    // Save the updated cart
    await cart.save();

    return {
      success: true,
      message: "Item removed from cart successfully",
      updatedCart: cart
    };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw new Error("Could not remove item from cart");
  }
};

const addSale = async (saleData, userId) => {
  try {

    const sale = await Sale.create({
      assetId: new mongoose.Types.ObjectId(saleData.assetId),
      OwnerId: new mongoose.Types.ObjectId(saleData.OwnerId),
      assetPrice: saleData.assetPrice,
      buyer: saleData.buyer,
      assetTitle: saleData.assetTitle,
      quantity: saleData.quantity,
      creatorName: saleData.creatorName,
    });

    await sale.save();

    if (!sale) {
      return { success: false, message: "Sale not created" };
    }

    const cart = await Cart.findOne({ createdBy: userId });

    cart.cartItems = []

    await cart.save()

    return { success: true, sales: [sale] };
  } catch (error) {
    console.log(error)
  }
};

const getSales = async (userId) => {
  try {
    const sales = await Sale.find({ OwnerId: userId });

    if (!sales || sales.length == 0) {
      return { success: false, message: "No sales found" };
    }

    return { success: true, sales };
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Could not fetch sales");
  }
};

const getPurchases = async (name) => {
  try {
    const sales = await Sale.find({ buyer: name });

    if (!sales || sales.length == 0) {
      return { success: false, message: "No sales found" };
    }

    return { success: true, sales };
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Could not fetch sales");
  }
};

module.exports = {
  shareAsset,
  getAssets,
  getAssetsById,
  shareCreation,
  getCreation,
  getCreationById,
  addToCart,
  getCart,
  deleteCart,
  addSale,
  getSales,
  getAllAssets,
  getPurchases
};
