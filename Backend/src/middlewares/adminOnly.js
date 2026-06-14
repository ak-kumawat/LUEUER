export const adminOnly = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden – admin access required",
    });
  }
  next();
};