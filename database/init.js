const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath = path.join(__dirname, "studyspot.db");
const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");
const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Could not open the database:", error.message);
    process.exitCode = 1;
    return;
  }

  db.run("PRAGMA foreign_keys = ON", (pragmaError) => {
    if (pragmaError) {
      finish(pragmaError);
      return;
    }

    const schema = fs.readFileSync(schemaPath, "utf8");
    const seed = fs.readFileSync(seedPath, "utf8");

    db.exec(schema, (schemaError) => {
      if (schemaError) {
        finish(schemaError);
        return;
      }

      db.exec(seed, (seedError) => {
        if (seedError) {
          finish(seedError);
          return;
        }

        console.log("StudySpot database initialized successfully.");
        finish(null);
      });
    });
  });
});

function finish(error) {
  if (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  }

  db.close((closeError) => {
    if (closeError) {
      console.error("Could not close the database:", closeError.message);
      process.exitCode = 1;
    }
  });
}
