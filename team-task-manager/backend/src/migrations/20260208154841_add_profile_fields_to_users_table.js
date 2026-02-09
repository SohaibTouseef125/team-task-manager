export async function up(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.text('bio');
    table.string('timezone', 50).defaultTo('America/New_York');
    table.string('language', 10).defaultTo('en');
    table.string('theme', 20).defaultTo('light');
    table.json('notifications').defaultTo('{}');
    table.json('privacy').defaultTo('{}');
    table.string('location', 100);
    table.string('job_title', 100);
    table.string('company', 100);
    table.string('website', 200);
    table.timestamp('last_login_at');
    table.string('phone', 20);
  });
}

export async function down(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('bio');
    table.dropColumn('timezone');
    table.dropColumn('language');
    table.dropColumn('theme');
    table.dropColumn('notifications');
    table.dropColumn('privacy');
    table.dropColumn('location');
    table.dropColumn('job_title');
    table.dropColumn('company');
    table.dropColumn('website');
    table.dropColumn('last_login_at');
    table.dropColumn('phone');
  });
}