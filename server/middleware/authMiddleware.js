const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.warn("No Authorization Header");
    return res.status(401).json({ message: "Unauthorized - No Token" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("No Token Found in Header");
    return res.status(401).json({ message: "Unauthorized - Token Missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.warn("Invalid Token:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
