import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import AppDataSource from '../src/config/db.config';

export const stopTestApp = async (postgresContainer: StartedPostgreSqlContainer) => {
    await AppDataSource.destroy();
    await postgresContainer.stop();
};
