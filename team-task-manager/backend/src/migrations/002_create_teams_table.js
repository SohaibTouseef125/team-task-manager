export async function up(knex) {
  return knex.schema.createTable('teams', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.integer('creator_id').unsigned().notNullable();
    table.foreign('creator_id').references('users.id').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['creator_id']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('teams');
}