export interface CancelPendingOrderDSL {
    givenSystemIsOperational(): Promise<void>;
    givenAnOrderExistsWithStatus(status: 'PENDING' | 'CONFIRMED'): Promise<void>;
    whenICancelTheOrder(): Promise<void>;
    thenOrderIsCancelled(): Promise<void>;
}

export interface CancelShippedOrderRejectedDSL {
    givenSystemIsOperational(): Promise<void>;
    givenAnOrderExistsWithStatus(status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED'): Promise<void>;
    whenICancelTheOrder(): Promise<void>;
    thenOrderCannotBeCancelled(): Promise<void>;
    thenOrderStatusIsUnchanged(expectedStatus: 'SHIPPED' | 'DELIVERED' | 'CANCELLED'): Promise<void>;
}

export interface CancelNonExistingOrderDSL {
    givenSystemIsOperational(): Promise<void>;
    whenICancelTheOrderWithId(id: number): Promise<void>;
    thenOrderIsNotFound(): Promise<void>;
}
