var jwt = require("jsonwebtoken");

// virfyToken
function virfyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedPayload;
      next();
    } catch (error) {
      return res.status(400).json({ message: "invalid token, access denied" });
    }
  } else {
    return res
      .status(201)
      .json({ message: "no token provided, access denied" });
  }
}

// Verify Token & Admin
function verifyTokenAndAdmin(req, res, next) {
  virfyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, omly admin" });
    }
  });
}

// Verify Token & only user himself
function verifyTokenOnlyUser(req, res, next) {
  virfyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "not allowed,  only user himself" });
    }
  });
}

// Verify Token admin or user himself
function verifyTokenAdminOrUser(req, res, next) {
  virfyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "not allowed,  admin or user himself" });
    }
  });
}
module.exports = {
  virfyToken,
  verifyTokenAndAdmin,
  verifyTokenOnlyUser,
  verifyTokenAdminOrUser,
};
