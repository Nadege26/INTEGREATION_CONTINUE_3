import { expect } from '@jest/globals';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { Express } from 'express';
import { Order, OrderStatus } from '../../Order';
import { buildApp } from '../../../../config/app';
import type {
    CancelPendingOrderDSL,
    CancelShippedOrderRejectedDSL,
    CancelNonExistingOrderDSL,
} from './cancelOrder.dsl';

// Infra partagée : démarrage d'un container PG + init DataSource + wire buildApp.
// Chaque driver de scénario l'utilise dans son givenSystemIsOperational().
async function bootInfrastructure(): Promise<{
    container: StartedPostgreSqlContainer;
    dataSource: DataSource;
    app: Express;
}> {
    const container = await new PostgreSqlContainer('postgres:16')
        .withExposedPorts(5432)
        .start();

    const dataSource = new DataSource({
        type: 'postgres',
        host: container.getHost(),
        port: container.getPort(),
        username: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
        logging: false,
        entities: [Order],
        synchronize: true,
        entitySkipConstructor: true,
    });

    await dataSource.initialize();

    const AppDataSource = require('../../../../config/db.config').default;
    const app = buildApp();
    Object.assign(AppDataSource, dataSource);

    return { container, dataSource, app };
}

async function teardownInfrastructure(
    container: StartedPostgreSqlContainer | undefined,
    dataSource: DataSource | undefined,
): Promise<void> {
    if (dataSource?.isInitialized) {
        await dataSource.destroy();
    }
    if (container) {
        await container.stop();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 1 : annulation réussie d'une commande PENDING
// ─────────────────────────────────────────────────────────────────────────────
export class CancelPendingOrderE2eDriver implements CancelPendingOrderDSL {
    private container!: StartedPostgreSqlContainer;
    private dataSource!: DataSource;
    private app!: Express;
    private response!: request.Response;
    private orderId!: number;

    async givenSystemIsOperational(): Promise<void> {
        const infra = await bootInfrastructure();
        this.container = infra.container;
        this.dataSource = infra.dataSource;
        this.app = infra.app;
    }

    async givenAnOrderExistsWithStatus(status: 'PENDING' | 'CONFIRMED'): Promise<void> {
        const repo = this.dataSource.getRepository(Order);
        const saved = await repo.save({
            productIds: [1, 2],
            totalPrice: 100,
            createdAt: new Date(),
            status: status as OrderStatus,
        } as Order);
        this.orderId = saved.id;
    }

    async whenICancelTheOrder(): Promise<void> {
        this.response = await request(this.app)
            .patch(`/api/orders/${this.orderId}/cancel`)
            .set('Content-Type', 'application/json');
    }

    async thenOrderIsCancelled(): Promise<void> {
        // Étant donné le status HTTP
        expect(this.response.status).toBe(200);
        expect(this.response.body.message).toBe('commande annulee');

        // Et l'état en base
        const repo = this.dataSource.getRepository(Order);
        const reloaded = await repo.findOneBy({ id: this.orderId });
        expect(reloaded).not.toBeNull();
        expect(reloaded!.status).toBe(OrderStatus.CANCELLED);
    }

    async cleanup(): Promise<void> {
        await teardownInfrastructure(this.container, this.dataSource);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 2 : annulation refusée pour une commande SHIPPED
// ─────────────────────────────────────────────────────────────────────────────
export class CancelShippedOrderRejectedE2eDriver implements CancelShippedOrderRejectedDSL {
    private container!: StartedPostgreSqlContainer;
    private dataSource!: DataSource;
    private app!: Express;
    private response!: request.Response;
    private orderId!: number;

    async givenSystemIsOperational(): Promise<void> {
        const infra = await bootInfrastructure();
        this.container = infra.container;
        this.dataSource = infra.dataSource;
        this.app = infra.app;
    }

    async givenAnOrderExistsWithStatus(
        status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
    ): Promise<void> {
        const repo = this.dataSource.getRepository(Order);
        const saved = await repo.save({
            productIds: [1],
            totalPrice: 50,
            createdAt: new Date(),
            status: status as OrderStatus,
        } as Order);
        this.orderId = saved.id;
    }

    async whenICancelTheOrder(): Promise<void> {
        this.response = await request(this.app)
            .patch(`/api/orders/${this.orderId}/cancel`)
            .set('Content-Type', 'application/json');
    }

    async thenOrderCannotBeCancelled(): Promise<void> {
        expect(this.response.status).toBe(400);
        expect(this.response.body.message).toBe('cette commande ne peut plus etre annulee');
    }

    async thenOrderStatusIsUnchanged(
        expectedStatus: 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
    ): Promise<void> {
        const repo = this.dataSource.getRepository(Order);
        const reloaded = await repo.findOneBy({ id: this.orderId });
        expect(reloaded).not.toBeNull();
        expect(reloaded!.status).toBe(expectedStatus as OrderStatus);
    }

    async cleanup(): Promise<void> {
        await teardownInfrastructure(this.container, this.dataSource);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scénario 3 : annulation d'une commande inexistante
// ─────────────────────────────────────────────────────────────────────────────
export class CancelNonExistingOrderE2eDriver implements CancelNonExistingOrderDSL {
    private container!: StartedPostgreSqlContainer;
    private dataSource!: DataSource;
    private app!: Express;
    private response!: request.Response;

    async givenSystemIsOperational(): Promise<void> {
        const infra = await bootInfrastructure();
        this.container = infra.container;
        this.dataSource = infra.dataSource;
        this.app = infra.app;
    }

    async whenICancelTheOrderWithId(id: number): Promise<void> {
        this.response = await request(this.app)
            .patch(`/api/orders/${id}/cancel`)
            .set('Content-Type', 'application/json');
    }

    async thenOrderIsNotFound(): Promise<void> {
        expect(this.response.status).toBe(404);
        expect(this.response.body.message).toBe('commande introuvable');
    }

    async cleanup(): Promise<void> {
        await teardownInfrastructure(this.container, this.dataSource);
    }
}
