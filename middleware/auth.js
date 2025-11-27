const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan. Akses ditolak.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
        }
        req.user = decoded.user; // Menyimpan data user ke request object
        next();
    });
}

// Middleware untuk otorisasi berdasarkan role
function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User tidak terautentikasi' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Akses ditolak. Hanya role ${allowedRoles.join(', ')} yang diperbolehkan.` 
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};