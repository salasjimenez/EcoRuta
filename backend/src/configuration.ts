const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
] as const;

export function validateEnvironment(config: Record<string, unknown>) {
  const missingVariables = requiredVariables.filter((name) => {
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
  const jwtExpiresSeconds = config.JWT_EXPIRES_SECONDS
    ? Number(config.JWT_EXPIRES_SECONDS)
    : 7200;
  const jwtSecret = String(config.JWT_SECRET);

  if (!Number.isInteger(databasePort) || databasePort <= 0) {
    throw new Error('DB_PORT debe ser un puerto numerico valido');
  }

  if (!Number.isInteger(apiPort) || apiPort <= 0) {
    throw new Error('PORT debe ser un puerto numerico valido');
  }

  if (!Number.isInteger(jwtExpiresSeconds) || jwtExpiresSeconds < 300) {
    throw new Error('JWT_EXPIRES_SECONDS debe ser un entero mayor o igual a 300');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }

  return {
    ...config,
    DB_PORT: databasePort,
    PORT: apiPort,
    JWT_EXPIRES_SECONDS: jwtExpiresSeconds,
  };
}
