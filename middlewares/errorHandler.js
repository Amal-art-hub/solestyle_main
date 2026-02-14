const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    const message = err.message || "Internal Server Error";


    // If it's an AJAX request or expects JSON, return JSON
    if (req.xhr || req.headers.accept.indexOf("json") > -1 || !req.accepts("html")) {
        return res.status(statusCode).json({
            success: false,
            status: statusCode,
            message: message,
            stack: process.env.NODE_ENV === "development" ? err.stack : {}
        });
    }

    // Otherwise return HTML
    res.status(statusCode).send(`<h1>Error ${statusCode}</h1><p>${message}</p>`);
    return;

};

export default errorHandler;