import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { InitialDatabaseSetup1758168000000 } from './migrations/1758168000000-initial-database-setup';
import { CreateUsers1789700400000 } from './migrations/1789700400000-create-users';
import { AddRolesAndProfiles1789714800000 } from './migrations/1789714800000-add-roles-and-profiles';
import { CreateVehicles1789797600000 } from './migrations/1789797600000-create-vehicles';
import { CreatePlannedRoutes1789884000000 } from './migrations/1789884000000-create-planned-routes';
import { AddRouteCapacity1789970400000 } from './migrations/1789970400000-add-route-capacity';

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }

  return value;
}

function databasePort(): number {
  const port = Number(required('DB_PORT'));

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('DB_PORT debe ser un puerto numerico valido');
  }

  return port;
}

export default new DataSource({
  type: 'postgres',
  host: required('DB_HOST'),
  port: databasePort(),
  database: required('DB_NAME'),
  username: required('DB_USER'),
  password: required('DB_PASSWORD'),
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrations: [
    InitialDatabaseSetup1758168000000,
    CreateUsers1789700400000,
    AddRolesAndProfiles1789714800000,
    CreateVehicles1789797600000,
    CreatePlannedRoutes1789884000000,
    AddRouteCapacity1789970400000,
  ],
});
