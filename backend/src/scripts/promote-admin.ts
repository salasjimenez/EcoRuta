import dataSource from '../database/data-source';

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error('Uso: npm run user:promote-admin -- correo@ejemplo.com');
  }

  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      const rows = (await manager.query(
        `
          UPDATE "users"
          SET "role" = 'admin', "updated_at" = now()
          WHERE lower("email") = lower($1)
          RETURNING "id", "email"
        `,
        [email],
      )) as Array<{ id: string; email: string }>;

      const user = rows[0];

      if (!user) {
        throw new Error(`No existe un usuario con el correo ${email}`);
      }

      await manager.query(
        `DELETE FROM "transporter_profiles" WHERE "user_id" = $1`,
        [user.id],
      );
      await manager.query(
        `DELETE FROM "company_profiles" WHERE "user_id" = $1`,
        [user.id],
      );
      await manager.query(
        `
          INSERT INTO "admin_profiles" ("user_id")
          VALUES ($1)
          ON CONFLICT ("user_id") DO NOTHING
        `,
        [user.id],
      );

      console.log(`Usuario ${user.email} promovido a admin`);
    });
  } finally {
    await dataSource.destroy();
  }
}

promoteAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
