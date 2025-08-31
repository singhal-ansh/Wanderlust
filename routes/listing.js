const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

//index route
router.get("/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});
//show route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
      path: "reviews",
      populate: { path: "author" }
   })
  .populate("owner");
  if(!listing) {
    req.flash("error", "Listing not found");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

//create route
router.post(
  "/",
  isLoggedIn,
  validateListing, 
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
  req.flash("success", "Successfully created a new listing!");
    res.redirect("/listings");
  })
);

//edit route
router.get("/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs",{listing});
}))

//delete route
router.delete("/:id", 
  isLoggedIn,
  isOwner,
  wrapAsync(async (req,res) => {
  let {id}  = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
}))

//Update route
router.put("/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req,res) => {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id,{...req.body.listing});
  req.flash("success", "Successfully updated the listing!");
  res.redirect("/listings");

}))

module.exports = router;