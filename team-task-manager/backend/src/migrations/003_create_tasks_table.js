export async function up(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title', 200).notNullable();
    table.text('description');
    table.enu('status', ['todo', 'in_progress', 'in_review', 'completed']).defaultTo('todo');
    table.enu('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.integer('team_id').unsigned().notNullable();
    table.foreign('team_id').references('teams.id').onDelete('CASCADE');
    table.integer('assigned_to').unsigned();
    table.foreign('assigned_to').references('users.id').onDelete('SET NULL');
    table.integer('created_by').unsigned().notNullable();
    table.foreign('created_by').references('users.id').onDelete('CASCADE');
    table.timestamp('due_date');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['team_id', 'status']);
    table.index(['assigned_to']);
    table.index(['created_by']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('tasks');
}