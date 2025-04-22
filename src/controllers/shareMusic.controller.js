const httpStatus = require('http-status');
const pick = require('../utils/pick');
const regexFilter = require('../utils/regexFilter');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { shareMusicService } = require('../services');

const shareAsset = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id,
    userName: req.user.name,
  };
  const shareMusicAsset = await shareMusicService.shareAsset(payload);
  res.status(httpStatus.CREATED).send(shareMusicAsset);
});

const getAssets = catchAsync(async (req, res) => {
  let result = [];
  if (req.user.role === 'user') {
    result = await shareMusicService.getAssets(req.user.id);
  } else {
    result = await shareMusicService.getAllAssets();
  }
  res.send(result);
});

const getAssetsById = catchAsync(async (req, res) => {
  const result = await shareMusicService.getAssetsById(req.params.id)
  res.send(result)
})

const shareCreation = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id,
    userName: req.user.name,
  };
  const shareMusicCreation = await shareMusicService.shareCreation(payload);
  res.status(httpStatus.CREATED).send(shareMusicCreation);
});

const getCreation = catchAsync(async (req, res) => {
  const result = await shareMusicService.getCreation(req.user.id);
  res.send(result);
});

const getCreationbyId = catchAsync(async (req, res) => {
  const result = await shareMusicService.getCreationById(req.params.id);
  res.send(result);
});


const addToCart = catchAsync(async (req, res) => {

  const assetId = req.params.id;
  const userId = req.user.id;

  const cart = await shareMusicService.addToCart(userId, assetId);
  res.status(httpStatus.CREATED).send(cart);

});

const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authentication middleware sets `req.user`
    const result = await shareMusicService.getCart(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params // Assuming authentication middleware sets `req.user`
    const result = await shareMusicService.deleteCart(userId, assetId);

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const finalItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const { saleData } = req.body;

    const result = await shareMusicService.addSale(saleData, userId);

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

const getSales = async (req, res) => {
  try {
    const userId = req.user.id;

    let result;
    if (req.user.role == 'user') {
      result = await shareMusicService.getSales(userId);
    } else {
      result = await shareMusicService.getPurchases(req.user.name);
    }

    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  shareAsset,
  getAssets,
  getAssetsById,
  shareCreation,
  getCreation,
  getCreationbyId,
  addToCart,
  getCart,
  deleteCart,
  finalItem,
  getSales
};
