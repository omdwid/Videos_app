import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  if (!query && !sortBy && !sortType && !userId) {
    throw new ApiError(400, "All fields of getAllVideos are required");
  }

  const videosAggregate = await Video.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    // {
    //   $addFields: {
    //     owner: "$owner"[0]
    //   }
    // },
    {
      $match: {
        owner: userId,
      },
    },
  ]);

  if (!videosAggregate) {
    throw new ApiError(400, "Invalid user Id");
  }

  options = {
    page,
    limit,
    sort: {
      sortBy: sortBy,
      sortType: sortType,
    },
  };
  const result = await Video.aggregatePaginate(videosAggregate, options);

  res.status(200).json(new ApiResponse(200, result.docs, "Videos fetched"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title && !description) {
    throw new ApiError(400, "Title and description is required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(401, "Video file not found");
  }
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(401, "Thumbnail not found");
  }

  const videoFileUrl = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

  const video = await Video.create({
    videoFile: videoFileUrl.url,
    thumbnail: thumbnailUrl.url,
    owner: req.user?._id,
    title: title,
    description: description,
    duration: videoFileUrl.duration,
  });

  const publishedVideo = Video.findById(video._id).select("-_id -__v");
  if (!publishedVideo) {
    throw new ApiError(500, "Error while publishing video to the database");
  }

  res
    .status(201)
    .json(new ApiResponse(201, publishedVideo, "Video Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const video = Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video Doesn't exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const video = findById(videoId);

  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath)?.url;

  video.title = title ? title : video.title;
  video.description = description ? description : video.description;
  video.thumbnail = thumbnailUrl ? thumbnailUrl : video.thumbnail;

  await video.save({ validateBeforeSave: false });

  const updatedVideo = Video.findById(videoId);

  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(400, "Video not found");
  }

  res.status(200).json(200, { deleteVideo }, "");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  video = await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Published Status changed"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
