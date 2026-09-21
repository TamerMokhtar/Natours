const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
// dotenv.config({ path: "./config.env" }); // Load environment variables from config.env file

const DB = process.env.DATABASE.replace(
  "<db_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL,{ // Connect to the local database
  .connect(DB)
  .then(() => {
    console.log("DB connection succeessful!");
  });

/* test the Tour model purpose only
const testTour = new Tour({
  name: "The Park Camper",
  price: 997,
});
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log("Error :", err);
  });
*/
//console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
