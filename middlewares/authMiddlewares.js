const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Kimlik doğrulama jetonu bulunamadı.' } });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Geçersiz veya süresi dolmuş token.' } });
        }
        req.user = {
            id: decoded.sub,
            role: decoded.role
        };
        next();
    });
};

module.exports = verifyToken;
