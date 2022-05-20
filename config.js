/** Common config for bookstore. */

let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}postgres:admin@localhost:5432/bookstore_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}postgres:admin@localhost:5432/bookstore`;
}


module.exports = { DB_URI };