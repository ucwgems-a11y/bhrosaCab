const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization; // "Bearer <token>"

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["token"]) {
    token = req.headers["token"];
  } else if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026"
    );
    req.admin = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAdmin;