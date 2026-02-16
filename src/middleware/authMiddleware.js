const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

    const authHeader = req.headers.authorization;

 if (!authHeader) {
    return res.status(401).json({ messages: "No token, authorization denied"});
}

const token = authHeader.split(" ")[1];

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId
    next();
} catch(error){
    res.status(401).json({ message: "Invalid token, authorization denied" });
}


};