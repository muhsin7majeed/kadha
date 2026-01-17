import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * UserMedia Schema
 *
 * This collection stores how a user interacts with a movie or TV show.
 * It does NOT store full movie data.
 * It stores:
 * - which user
 * - which media (from TMDB)
 * - what actions the user has taken (liked, watched, watchlist)
 * - a small cache of media data to avoid extra TMDB calls
 */
const UserMediaSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    media_id: {
      type: Number,
      required: true,
    },

    media_type: {
      type: String,
      enum: ['movie', 'tv'],
      required: true,
    },

    liked: {
      type: Boolean,
      default: false,
    },

    watched: {
      type: Boolean,
      default: false,
    },

    watchlist: {
      type: Boolean,
      default: false,
    },

    /**
     * Cached media data
     * used to render lists without calling TMDB again.
     */
    title: {
      type: String,
    },

    poster_path: {
      type: String,
    },
    vote_average: {
      type: Number,
    },
    vote_count: {
      type: Number,
    },
    adult: {
      type: Boolean,
    },
    genre_ids: {
      type: [Number],
    },

    release_date: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Compound index
 *
 * Ensures:
 * - A user can only have ONE document per media item
 * - Fast lookups when checking user interactions
 */
UserMediaSchema.index({ userId: 1, media_id: 1, media_type: 1 }, { unique: true });

export default mongoose.model('UserMedia', UserMediaSchema);
