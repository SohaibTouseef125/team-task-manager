export async function up(knex) {
  return knex.schema.createTable('memberships', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.integer('team_id').unsigned().notNullable();
    table.foreign('team_id').references('teams.id').onDelete('CASCADE');
    table.enu('role', ['admin', 'member']).defaultTo('member');
    table.timestamp('joined_at').defaultTo(knex.fn.now()).notNullable();

    table.unique(['user_id', 'team_id']);
    table.index(['user_id']);
    table.index(['team_id']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('memberships');
}