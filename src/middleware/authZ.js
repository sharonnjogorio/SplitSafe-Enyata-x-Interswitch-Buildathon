const jwt = require("jsonwebtoken")

exports.protect = (req, res, next) => {
  const auth = req.headers.authorization

  // Check header exists and starts with Bearer
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized — no token" })
  }

  // Extract token from "Bearer <token>"
  const token = auth.split(" ")[1]

  try {
    // Verify token — throws error if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // { id: "userId" } now available in all controllers
    return next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}