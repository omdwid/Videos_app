import { Schema, model } from "mongoose";

const playlistSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		videos: [
			{
				type: Schema.Types.ObjectId,
				ref: "Video"
			}
		],
		description: {
			type: String,
			default: ""
		}
	}
, { timestamps: true });

export const Playlist = model("Playlist", playlistSchema);
