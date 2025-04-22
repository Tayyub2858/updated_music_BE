// const passport = require('passport');
// const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
// const { roleRights } = require('../config/roles');

// const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
//   console.log('userRights in auth:', user.role);
//   if (err || info || !user) {
//     return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
//   }
//   req.user = user;

//   if (requiredRights.length) {
//     const userRights = roleRights.get(user.role);
//     const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
//     console.log('requiredRights in auth:', requiredRights);

//     if (!hasRequiredRights && req.params.userId !== user.id) {
//       return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
//     }
//   }

//   resolve();
// };

// const auth = (...requiredRights) => async (req, res, next) => {
//   console.log('requiredRights:', requiredRights)
//   return new Promise((resolve, reject) => {
//     passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
//   })
//     .then(() => next())
//     .catch((err) => next(err));
// };

// module.exports = auth;


const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject, allowedRoles) => async (err, user, info) => {
  console.log('User Role:', user?.role);

  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  // Check if the user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }

  resolve();
};

const auth = (...allowedRoles) => async (req, res, next) => {
  console.log('Allowed Roles:', allowedRoles);

  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, allowedRoles))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;