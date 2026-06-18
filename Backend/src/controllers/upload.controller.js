import uploadOnCloudinary from '../util/cloudinary.js'
import ApiError from '../util/ApiError.js'
import ApiResponse from '../util/ApiResponse.js'
import asyncHandler from '../util/asyncHandler.js'

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file provided")
  }

  const result = await uploadOnCloudinary(req.file.path)

  if (!result) {
    throw new ApiError(500, "Image upload failed")
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: result.secure_url,
      publicId: result.public_id
    }, "Image uploaded successfully")
  )
})
