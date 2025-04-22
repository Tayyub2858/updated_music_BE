const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { ObjectId } = require('mongodb');

const orderSchema = mongoose.Schema(
  {
    musicIds: [
      {
        type: String,
      }
    ],
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    title: {
      type: String
    },
    startTime: {
      type: Date,
      default: Date.now()
    },
    description: {
      type: String
    },
    details: {
      type: String
    },
    delivery_time: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['inprogress', 'accepted', 'delivring', 'revision', 'cancel', 'complete'],
      default: "inprogress",
      required: true
    },
    revison_message: {
      type: String,
    },
    cancel_message: {
      type: String
    },
    rating: {
      type: Number
    },
    review: {
      type: String
    },
    tip: {
      type: Number
    },
    createdBy: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * @typedef Job
 */
const Order = mongoose.model('Orders', orderSchema);

module.exports = Order;
