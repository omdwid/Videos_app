const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}


export { asyncHandler }

// // samaj me nahi aaya
// const asyncHandler = (requesthandler) => {
//   return Promise.resolve(requesthandler(req, res, next)).catch((error) =>
//     next(error)
//   );
// };

// const asyncHandler = (requesthandler) => {
//   return async (req, res, next) => {
//     try {
//       await requesthandler(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
// };

// export { asyncHandler };