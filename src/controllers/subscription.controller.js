import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // TODO: toggle subscription
  const channelId = subscriberId;

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (!subscription) {
    const sub = await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, {}, "Subscription Added"));
  }

  const deletedSubscription = await Subscription.findByIdAndDelete(subscription._id);
  res.status(200).json(new ApiError(200, {deletedSubscription}, "Unsubscribed the channel"))
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscribers = await Subscription.countDocuments({ channel: channelId });

  res
    .status(200)
    .json(
      new ApiResponse(200, { subscribers }, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.countDocuments({
    subscriber: subscriberId,
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels },
        "Subscribed channel fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
