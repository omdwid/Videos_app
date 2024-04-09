import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: req.user?._id,
  });

  res.status(201).json(new ApiResponse(201, tweet, "New Tweet created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const {userId} = req.params;
  // TODO: get user tweets
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User Tweets fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found");
  }

  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  tweet.content = content;
  const updatedTweet = await tweet.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const {tweetId} = req.params;
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if(!deletedTweet){
    throw new ApiError(404, "Tweet Not Found");
  }
  
  return res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted Successfully"))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
