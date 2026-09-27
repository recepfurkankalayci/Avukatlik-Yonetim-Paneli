

const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        stack: err.stack
    });

    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'Bir hata oluştu.';

    res.status(statusCode).json({
        error: { code, message }
    });
};

module.exports = errorHandler;
