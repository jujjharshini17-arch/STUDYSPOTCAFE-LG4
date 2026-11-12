const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath = path.join(__dirname, "studyspot.db");
const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Could not open the test database:", error.message);
    process.exitCode = 1;
  }
});
let failures = 0;

function pass(name) {
  console.log(`PASS: ${name}`);
}

function fail(name, error) {
  failures += 1;
  console.error(`FAIL: ${name}${error ? ` - ${error.message || error}` : ""}`);
}

function run(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, parameters, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, parameters = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, parameters, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function close() {
  return new Promise((resolve) => {
    db.close((error) => {
      if (error) fail("close database", error);
      resolve();
    });
  });
}

async function check(name, action) {
  try {
    await action();
    pass(name);
  } catch (error) {
    fail(name, error);
  }
}

async function main() {
  await run("PRAGMA foreign_keys = ON");

  await check("all three tables exist", async () => {
    const rows = await all(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?)",
      ["students", "carrels", "bookings"]
    );
    if (rows.length !== 3) throw new Error(`Found ${rows.length} of 3 required tables`);
  });

  await check("students can be retrieved", async () => {
    const rows = await all("SELECT student_id, student_name, email FROM students");
    if (rows.length < 3) throw new Error("Expected at least 3 students");
  });

  await check("carrels can be retrieved", async () => {
    const rows = await all("SELECT carrel_id, name, zone FROM carrels");
    if (rows.length < 5) throw new Error("Expected at least 5 carrels");
  });

  await check("booking JOIN returns student and carrel names", async () => {
    const rows = await all(
      `SELECT bookings.booking_id, students.student_name, carrels.name AS carrel_name
       FROM bookings
       INNER JOIN students ON bookings.student_id = students.student_id
       INNER JOIN carrels ON bookings.carrel_id = carrels.carrel_id`
    );
    if (rows.length < 3 || !rows[0].student_name || !rows[0].carrel_name) {
      throw new Error("JOIN results are missing expected records or names");
    }
  });

  await check("searching by zone works", async () => {
    const rows = await all("SELECT * FROM carrels WHERE zone = ?", ["Quiet"]);
    if (rows.length < 1 || rows.some((row) => row.zone !== "Quiet")) {
      throw new Error("Quiet zone search returned unexpected results");
    }
  });

  await check("GROUP BY returns correct zone counts", async () => {
    const rows = await all(
      "SELECT zone, COUNT(*) AS carrel_count FROM carrels GROUP BY zone"
    );
    const counts = Object.fromEntries(rows.map((row) => [row.zone, row.carrel_count]));
    if (counts.Quiet !== 3 || counts.Group !== 2) {
      throw new Error(`Unexpected zone counts: ${JSON.stringify(counts)}`);
    }
  });

  await check("invalid foreign key references are rejected", async () => {
    try {
      await run("INSERT INTO bookings (student_id, carrel_id) VALUES (?, ?)", [999999, 999999]);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT") return;
      throw error;
    }
    throw new Error("Invalid booking was accepted");
  });

  let testCarrelId;
  await check("carrel can be inserted, updated and deleted", async () => {
    const inserted = await run(
      "INSERT INTO carrels (name, zone) VALUES (?, ?)",
      ["Temporary Test Carrel", "Test"]
    );
    testCarrelId = inserted.lastID;

    await run("UPDATE carrels SET name = ?, zone = ? WHERE carrel_id = ?", [
      "Updated Test Carrel",
      "Test",
      testCarrelId,
    ]);
    const updated = await all("SELECT name FROM carrels WHERE carrel_id = ?", [testCarrelId]);
    if (updated.length !== 1 || updated[0].name !== "Updated Test Carrel") {
      throw new Error("Updated carrel was not found");
    }

    const deleted = await run("DELETE FROM carrels WHERE carrel_id = ?", [testCarrelId]);
    testCarrelId = null;
    if (deleted.changes !== 1) throw new Error("Test carrel was not deleted");
  });

  if (testCarrelId !== undefined && testCarrelId !== null) {
    await run("DELETE FROM carrels WHERE carrel_id = ?", [testCarrelId]).catch((error) => {
      fail("clean up temporary carrel", error);
    });
  }

  await close();
  console.log(failures === 0 ? "All database checks passed." : `${failures} database check(s) failed.`);
  if (failures > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  fail("database test run", error);
  await close();
  process.exitCode = 1;
});


