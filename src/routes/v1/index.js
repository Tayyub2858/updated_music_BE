const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const musicRoute = require('./music.route');
const userSpaceRoute = require('./userSpace.route');
const jobsRoute = require('./job.route');
const uploadRoute = require('./upload.route');
const trackRoute = require('./track.route');
const shareMusicRoute = require('./musicAsset.route');
const shareMusicCreationRoute = require('./musicCreation.route');
const docsRoute = require('./docs.route');
const paypalRoutes = require('./payment.route.js');
const chatRoutes = require('./chat.route.js');
const orderRoutes = require('./order.route.js')

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/music',
    route: musicRoute,
  },
  {
    path: '/user-space',
    route: userSpaceRoute,
  },
  {
    path: '/job',
    route: jobsRoute,
  },
  {
    path: '/upload',
    route: uploadRoute,
  },
  {
    path : '/lyrics',
    route : musicRoute
  },
  {
    path: '/tracks',
    route: trackRoute,
  },
  {
    path: '/music-asset',
    route: shareMusicRoute,
  },
  {
    path: '/music-creation',
    route: shareMusicCreationRoute,
  },
  {
    path: '/paypal',
    route: paypalRoutes,
  },
  {
    path: '/order',
    route: orderRoutes
  },
  {
    path: '/chat-system',
    route: chatRoutes,
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
