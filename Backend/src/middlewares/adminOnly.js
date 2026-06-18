import ApiError from '../util/ApiError.js'

const adminOnly = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json(
      new ApiError(403, "Admin access required")
    )
  }
  next()
}

export default adminOnly
