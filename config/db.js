const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath = path.join(__dirname, "..", "database", "studyspot.db");
const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Could not connect to the StudySpot database:", error.message);
    return;
  }

  db.run("PRAGMA foreign_keys = ON", (pragmaError) => {
    if (pragmaError) {
      console.error("Could not enable foreign key checks:", pragmaError.message);
      return;
    }

    console.log("Connected to the StudySpot database.");
  });
});

module.exports = db;
