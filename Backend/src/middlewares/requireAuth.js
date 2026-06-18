import ApiError from '../util/ApiError.js'

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      new ApiError(401, "Login required")
    )
  }
  next()
}

export default requireAuth
