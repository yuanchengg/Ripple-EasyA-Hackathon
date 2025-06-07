export function up(knex) {
  return knex.schema.createTable('verification_logs', (table) => {
    table.increments('id').primary();
    table.integer('escrow_id').unsigned().references('id').inTable('escrows').onDelete('CASCADE');
    table.string('verification_type').notNullable(); // satellite, manual, sensor
    table.json('verification_data').notNullable();
    table.timestamp('verified_at').notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('verification_logs');
} 