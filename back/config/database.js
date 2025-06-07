// back/config/database.js
import knex from "knex";

const config = {
  client: "sqlite3",
  connection: {
    filename: "./climate_aid.db",
  },
  useNullAsDefault: true,
  migrations: {
    directory: "./migrations",
  },
};

module.exports = knex(config);

// create_farmers_table.js
exports.up = function (knex) {
  return knex.schema.createTable("farmers", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("location").notNullable();
    table.string("xrp_address").notNullable().unique();
    table.decimal("farm_size", 10, 2); // in hectares
    table.string("primary_crop");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("farmers");
};

// create_escrows_table.js
exports.up = function (knex) {
  return knex.schema.createTable("escrows", function (table) {
    table.increments("id").primary();
    table
      .integer("farmer_id")
      .unsigned()
      .references("id")
      .inTable("farmers")
      .onDelete("CASCADE");
    table.decimal("amount", 12, 6).notNullable(); // XRP amount
    table.string("practice_type").notNullable(); // drought-resistant, water-saving, etc.
    table
      .enum("status", ["pending", "verified", "released", "expired"])
      .defaultTo("pending");
    table.string("condition_hash").notNullable();
    table.text("fulfillment_data");
    table.string("xrpl_sequence"); // XRPL transaction sequence
    table.datetime("deadline").notNullable();
    table.datetime("verified_at");
    table.datetime("released_at");
    table.text("verification_data");
    table.string("satellite_image_url");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("escrows");
};

// create_verification_logs_table.js
exports.up = function (knex) {
  return knex.schema.createTable("verification_logs", function (table) {
    table.increments("id").primary();
    table
      .integer("escrow_id")
      .unsigned()
      .references("id")
      .inTable("escrows")
      .onDelete("CASCADE");
    table.string("verification_type").notNullable(); // satellite, iot, manual
    table.text("verification_data");
    table.string("verifier_id"); // who verified
    table.datetime("verified_at").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("verification_logs");
};

// back/knexfile.js
module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./climate_aid.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },

  production: {
    client: "sqlite3",
    connection: {
      filename: process.env.DATABASE_PATH || "./climate_aid.db",
    },
    useNullAsDefault: true,
    migrations: {
      directory: "./migrations",
    },
  },
};
