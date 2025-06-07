export function up(knex) {
  return knex.schema.createTable('escrows', (table) => {
    table.increments('id').primary();
    table.integer('farmer_id').unsigned().references('id').inTable('farmers').onDelete('CASCADE');
    table.decimal('amount', 20, 6).notNullable(); // XRP amount
    table.string('practice_type').notNullable(); // drought-resistant, water-saving, etc.
    table.enum('status', ['pending', 'verified', 'released', 'cancelled']).defaultTo('pending');
    table.string('condition_hash').notNullable();
    table.string('fulfillment_data').notNullable();
    table.integer('xrpl_sequence'); // XRPL transaction sequence
    table.timestamp('deadline').notNullable();
    table.timestamp('verified_at');
    table.timestamp('released_at');
    table.json('verification_data');
    table.string('satellite_image_url');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('escrows');
} 