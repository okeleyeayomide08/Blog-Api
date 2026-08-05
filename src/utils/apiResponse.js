function successMessage(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
}

function errorMessage(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
}

export { successMessage, errorMessage };
