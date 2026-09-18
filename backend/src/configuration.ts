const requiredDatabaseVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
] as const;

export function validateEnvironment(config: Record<string, unknown>) {
  const missingVariables = requiredDatabaseVariables.filter((name) => {
    const value = config[name];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingVariables.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missingVariables.join(', ')}`,
    );
  }

  const databasePort = Number(config.DB_PORT);
  const apiPort = config.PORT ? Number(config.PORT) : 3000;

  if (!Number.isInteger(databasePort) || databasePort <= 0) {
    throw new Error('DB_PORT debe ser un puerto numerico valido');
  }

  if (!Number.isInteger(apiPort) || apiPort <= 0) {
    throw new Error('PORT debe ser un puerto numerico valido');
  }

  return {
    ...config,
    DB_PORT: databasePort,
    PORT: apiPort,
  };
}
