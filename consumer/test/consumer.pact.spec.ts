import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { InventoryClient } from '../src/inventoryClient.js';
import { ReservationService } from '../src/reservationService.js';

const { like, integer, regex } = MatchersV3;

const provider = new PactV3({
  consumer: 'reservation-consumer',
  provider: 'inventory-provider',
  port: 1234,
  log: path.resolve(process.cwd(), '../pact/logs/consumer.log'),
  dir: path.resolve(process.cwd(), '../pact/pacts'),
});

describe('Consumer contract tests', () => {
  it('returns available inventory for a product with stock', async () => {
    provider.given('available_stock');
    provider.uponReceiving('a request for an available SKU');
    provider.withRequest({
      method: 'GET',
      path: '/inventory/A100',
    });
    provider.willRespondWith({
      status: 200,
      body: {
        sku: like('A100'),
        name: like('Laptop Ultra'),
        availableQuantity: integer(8),
        price: like(1200),
        status: like('AVAILABLE'),
      },
    });

    await provider.executeTest(async (mockServer) => {
      const client = new InventoryClient(mockServer.url);
      const service = new ReservationService(client);
      const result = await service.checkReservationEligibility('A100');

      expect(result.kind).toBe('available');
      if (result.kind !== 'available') throw new Error('Expected available inventory');
      expect(result.inventory.sku).toBe('A100');
      expect(result.inventory.availableQuantity).toBeGreaterThan(0);
    });
  });

  it('returns out-of-stock for a product with zero stock', async () => {
    provider.given('out_of_stock');
    provider.uponReceiving('a request for a stockless SKU');
    provider.withRequest({
      method: 'GET',
      path: '/inventory/B200',
    });
    provider.willRespondWith({
      status: 200,
      body: {
        sku: like('B200'),
        name: like('Mouse Pro'),
        availableQuantity: integer(0),
        price: like(45),
        status: like('OUT_OF_STOCK'),
      },
    });

    await provider.executeTest(async (mockServer) => {
      const client = new InventoryClient(mockServer.url);
      const service = new ReservationService(client);
      const result = await service.checkReservationEligibility('B200');

      expect(result.kind).toBe('out_of_stock');
      if (result.kind !== 'out_of_stock') throw new Error('Expected out-of-stock inventory');
      expect(result.inventory.availableQuantity).toBe(0);
    });
  });

  it('returns missing SKU not found', async () => {
    provider.given('sku_not_found');
    provider.uponReceiving('a request for a missing SKU');
    provider.withRequest({
      method: 'GET',
      path: '/inventory/Z999',
    });
    provider.willRespondWith({
      status: 404,
      body: {
        code: like('SKU_NOT_FOUND'),
        message: regex('SKU [A-Z0-9]+ not found', 'SKU Z999 not found'),
      },
    });

    await provider.executeTest(async (mockServer) => {
      const client = new InventoryClient(mockServer.url);
      const service = new ReservationService(client);
      const result = await service.checkReservationEligibility('Z999');

      expect(result.kind).toBe('not_found');
      if (result.kind !== 'not_found') throw new Error('Expected missing SKU');
      expect(result.error.code).toBe('SKU_NOT_FOUND');
    });
  });
});
