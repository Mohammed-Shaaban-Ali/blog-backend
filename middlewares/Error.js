// not found middleware
const notFund = (req, res, next) => {
  const error = new Error(`not found ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// error handling
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    massage: err.massage,
    stack: process.env.NODE_ENV !== "production" ? null : err.stack,
  });
};

module.exports = {
  notFund,
  errorHandler,
};
