const isAdmin = (req,res,next) =>{
    if(req.user && req.user.role === "ADMIN"){
        next();
    }
    else {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Bu işlem için ADMIN yetkisi gereklidir.' } });
    }
};

module.exports = {isAdmin};