const httpStatus = require('http-status');
const pick = require('../utils/pick');
const regexFilter = require('../utils/regexFilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');


// const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        // orderData.createdBy = req.user._id;
        // orderData.myId = req.user._id // Attach the user ID from the authenticated request
        const order = await orderService.createOrder(orderData);
        res.status(httpStatus.CREATED).send(order);
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};

const getOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderService.getOrderById(orderId);
        if (!order) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
        }
        res.status(httpStatus.OK).send(order);
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status, message } = req.body;
        let updatedOrder;
        if (message != (undefined || null)) {
            updatedOrder = await orderService.updateOrderStatus(orderId, status, message);
        }
        updatedOrder = await orderService.updateOrderStatus(orderId, status, " ");
        res.status(httpStatus.OK).send(updatedOrder);
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};
const addReviewAndRating = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { rating, review, tip } = req.body;

        // Validate rating (should be a number between 1 and 5)
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Rating must be a number between 1 and 5');
        }

        // Call the service to add review and rating
        const updatedOrder = await orderService.addReviewAndRating(orderId, { rating, review, tip });

        res.status(httpStatus.OK).send(updatedOrder);
    } catch (error) {
        res.status(error.statusCode || httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};
const getMyOrders = async (req, res) => {
    try {
        const user = req.user;
        // console.log(user, 'user')
        const orders = await orderService.getMyOrders(user);
        res.status(httpStatus.OK).send(orders);
    } catch (error) {
        res.status(error.statusCode || httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};

const getCompletedOrders = async (req, res) => {
    try {
        const user = req.user;

        const orders = await orderService.getCompletedOrders(user);
        res.status(httpStatus.OK).send(orders);
    } catch (error) {
        res.status(error.statusCode || httpStatus.BAD_REQUEST).send({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrder,
    updateOrderStatus,
    addReviewAndRating,
    getMyOrders,
    getCompletedOrders,
};