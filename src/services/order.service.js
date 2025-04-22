const Order = require('../models/order.model');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Mongoose } = require('mongoose');

const createOrder = async (orderData) => {
    console.log(orderData, 'data to save here')
    const order = await Order.create(orderData.order);
    if (!order) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error while posting the order request")
    return order;
};

const getOrderById = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }
    return order;
};

const updateOrderStatus = async (orderId, status, message) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // Update status and message based on the status type
    order.status = status;
    if (status === 'revision') {
        order.revison_message = message;
    } else if (status === 'cancel') {
        order.cancel_message = message;
    }

    await order.save();
    return order;
};

const addReviewAndRating = async (orderId, { rating, review, tip }) => {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // Update the order with the new review and rating
    order.rating = rating;
    order.review = review;
    order.price = order.price + tip
    order.tip = tip

    // Save the updated order
    await order.save();

    return order;
};

const getMyOrders = async (user) => {


    // let query = {};

    // Fetch orders based on user role
    let orders;
    if (user.role === 'user') {
        // query = { createdBy: Mongoose.Scheme.types.ObjectId(user._id) }; // Fetch orders created by the user
        orders = await Order.find({ createdBy: (user._id || user.id) }) // Populate user details if needed
    } else if (user.role === 'recruiter') {
        orders = await Order.find({ recruiterId: (user._id || user.id) }) // Populate user details if needed
        // query = { recruiterId: Mongoose.Scheme.types.ObjectId(user._id) }; // Fetch orders assigned to the recruiter
    } else {
        throw new ApiError(httpStatus.FORBIDDEN, 'Invalid user role');
    }

    // Find orders in the database
    return orders;
};

const getCompletedOrders = async (user) => {
    // Fetch orders with status "complete" and created by the current user
    const orders = await Order.find({ createdBy: (user._id || user.id), status: 'complete' })
        .select('title price tip startTime recruiterId') // Include recruiterId in the selection
        .populate('recruiterId', 'name')
    // Convert Mongoose documents to plain JavaScript objects

    // Map through the orders to include tip and recruiter name
    const formattedOrders = orders.map((order) => ({
        title: order.title,
        price: order.price,
        startTime: order.startTime,
        by: user.name || 'Unknown', // Include buyer's name or 'Unknown' if not available
        tip: order.tip || null, // Include tip if it exists, otherwise null
        buyer: order.recruiterId?.name || 'Unknown', // Include recruiter's name or 'Unknown' if not available
    }));

    return formattedOrders;
};


module.exports = {
    createOrder,
    getOrderById,
    updateOrderStatus,
    addReviewAndRating,
    getMyOrders,
    getCompletedOrders
};