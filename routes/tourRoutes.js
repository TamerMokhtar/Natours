const express = require("express");

const tourController = require("./../controllers/tourController");
const router = express.Router();

//router.param("id", tourController.checkID); // Middleware to check ID for all routes with :id (in your own application)

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours); // Middleware to alias top 5 cheap tours

router.route("/tour-stats").get(tourController.getTourStats); // Route to get tour statistics
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan); // Route to get monthly plan for a given year

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour); // tourController.checkBody was for // Middleware to check body for POST requests (in your own application)
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
