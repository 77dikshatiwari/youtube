const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asuncHandler2 = ()=> {}
// const asyncHandler2 = (func) => () => {}
// const asyncHandler2 = (func) => async () => {}

// const asyncHandler1 = (fn) => async (req, res, next) => {
//  try {
//     await fn(req, res, next)
//  } catch (error) {
//     res.status(error.code || 500).json({success: false, message: error.message})
//  }
// }
