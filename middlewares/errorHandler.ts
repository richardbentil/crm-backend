const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
        message: error.message,
        status: statusCode
    })
    next()
}

export default errorHandler