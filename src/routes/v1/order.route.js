const express = require('express')
const auth = require('../../middlewares/auth')
const { orderController } = require('../../controllers')

const router = express.Router();


router.post('/create', auth('user'), orderController.createOrder);

router.get('/sales', auth('user'), orderController.getCompletedOrders);

router.get('/my/orders', auth('user', 'recruiter'), orderController.getMyOrders);
// Get an order by ID
router.get('/:orderId', auth('user', 'recruiter'), orderController.getOrder);
// Update order status
router.put('/:orderId/status', auth('user', 'recruiter'), orderController.updateOrderStatus);


router.post('/:orderId/review', auth('user', 'recruiter'), orderController.addReviewAndRating);


module.exports = router;
