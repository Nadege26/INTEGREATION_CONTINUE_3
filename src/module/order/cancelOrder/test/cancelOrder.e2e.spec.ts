import { describe, test, afterEach } from '@jest/globals';
import {
    CancelPendingOrderE2eDriver,
    CancelShippedOrderRejectedE2eDriver,
    CancelNonExistingOrderE2eDriver,
} from './cancelOrder.e2eDriver';

describe('Annuler une commande — E2E', () => {
    let cancelPendingDriver: CancelPendingOrderE2eDriver;
    let cancelShippedDriver: CancelShippedOrderRejectedE2eDriver;
    let cancelNonExistingDriver: CancelNonExistingOrderE2eDriver;

    afterEach(async () => {
        await cancelPendingDriver?.cleanup();
        await cancelShippedDriver?.cleanup();
        await cancelNonExistingDriver?.cleanup();
    });

    test("Scénario 1 : annulation réussie d'une commande PENDING", async () => {
        cancelPendingDriver = new CancelPendingOrderE2eDriver();

        // Étant donné que le système est opérationnel
        await cancelPendingDriver.givenSystemIsOperational();
        // Et qu'une commande existe avec le statut PENDING
        await cancelPendingDriver.givenAnOrderExistsWithStatus('PENDING');

        // Quand j'annule la commande
        await cancelPendingDriver.whenICancelTheOrder();

        // Alors la commande est annulée (HTTP 200 + statut CANCELLED en base)
        await cancelPendingDriver.thenOrderIsCancelled();
    });

    test('Scénario 2 : annulation refusée pour une commande SHIPPED', async () => {
        cancelShippedDriver = new CancelShippedOrderRejectedE2eDriver();

        // Étant donné que le système est opérationnel
        await cancelShippedDriver.givenSystemIsOperational();
        // Et qu'une commande existe avec le statut SHIPPED
        await cancelShippedDriver.givenAnOrderExistsWithStatus('SHIPPED');

        // Quand j'annule la commande
        await cancelShippedDriver.whenICancelTheOrder();

        // Alors l'annulation est refusée (HTTP 400)
        await cancelShippedDriver.thenOrderCannotBeCancelled();
        // Et le statut en base n'a pas changé
        await cancelShippedDriver.thenOrderStatusIsUnchanged('SHIPPED');
    });

    test("Scénario 3 : annulation d'une commande inexistante", async () => {
        cancelNonExistingDriver = new CancelNonExistingOrderE2eDriver();

        // Étant donné que le système est opérationnel
        await cancelNonExistingDriver.givenSystemIsOperational();

        // Quand j'annule une commande dont l'id n'existe pas
        await cancelNonExistingDriver.whenICancelTheOrderWithId(9999);

        // Alors j'obtiens une 404 "commande introuvable"
        await cancelNonExistingDriver.thenOrderIsNotFound();
    });
});
