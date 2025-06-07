export function up(knex) {
  return knex.schema.createTable("escrows", (table) => {
    table.increments("id").primary();
    table
      .integer("farmer_id")
      .unsigned()
      .references("id")
      .inTable("farmers")
      .onDelete("CASCADE");
    table.decimal("amount", 12, 6).notNullable(); // XRP amount
    table.string("practice_type").notNullable();
    table
      .enum("status", ["pending", "verified", "released", "expired"])
      .defaultTo("pending");
    table.string("condition_hash").notNullable();
    table.text("fulfillment_data");
    table.string("xrpl_sequence");
    table.datetime("deadline").notNullable();
    table.datetime("verified_at");
    table.datetime("released_at");
    table.text("verification_data");
    table.string("satellite_image_url");
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable("escrows");
}
