export function up(knex) {
  return knex.schema.createTable('farmers', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('location').notNullable();
    table.string('xrp_address').notNullable().unique();
    table.decimal('farm_size', 10, 2).notNullable();
    table.string('primary_crop').notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('farmers');
} 