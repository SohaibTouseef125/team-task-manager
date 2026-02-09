export async function up(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('description');
    table.string('type', 50).notNullable(); // task_assignment, task_completion, team_invite, deadline_reminder, comment_added
    table.integer('related_id').unsigned(); // Related to task_id, team_id, etc.
    table.string('related_type', 50); // task, team, etc.
    table.boolean('read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id']);
    table.index(['user_id', 'read']);
    table.index(['created_at']);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('notifications');
}