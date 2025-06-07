export function up(knex) {
  return knex.schema.createTable("verification_logs", (table) => {
    table.increments("id").primary();
    table
      .integer("escrow_id")
      .unsigned()
      .references("id")
      .inTable("escrows")
      .onDelete("CASCADE");
    table.string("verification_type").notNullable();
    table.text("verification_data");
    table.datetime("verified_at").notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable("verification_logs");
}
