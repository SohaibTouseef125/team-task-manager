export async function up(knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.string('sid').primary();
    table.json('sess').notNullable();
    table.timestamp('expire', { useTz: true }).notNullable();

    table.index(['expire']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('sessions');
}