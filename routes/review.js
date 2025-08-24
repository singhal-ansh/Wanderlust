const express = require('express');
const router = express.Router({mergeParams: true}); // mergeParams allows access to params from parent route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((err) => err.message).join(", ");
    throw new ExpressError(400, errmsg);
  }
  next();
};

// Create review
router.post("/", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "Successfully added a new review!");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
