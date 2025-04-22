const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const saleSchema = new mongoose.Schema(
    {
        assetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShareMusicAsset"
        },
        OwnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        buyer: {
            type: String,
            required: true
        },
        creatorName: {
            type: String,
            required: true
        },
        assetTitle: {
            type: String,
            required: true
        },
        assetPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);

// add plugin that converts mongoose to json
saleSchema.plugin(toJSON);
saleSchema.plugin(paginate);

/**
 * @typedef Sale
 */
const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
