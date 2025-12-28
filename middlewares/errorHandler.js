
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    const message = err.message || "Internal Server Error";

  
    if (req.accepts('html')) {
 
        res.status(statusCode).send(`<h1>Error ${statusCode}</h1><p>${message}</p>`);
        return;
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
    
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

module.exports = errorHandler;