import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Verifier } from '@pact-foundation/pact';
import path from 'node:path';
import { createProviderApp } from '../src/server.js';

const app = createProviderApp();

const providerStates = {
  available_stock: () => true,
  out_of_stock: () => true,
  sku_not_found: () => true,
};

describe('Provider verification', () => {
  let server: ReturnType<typeof app.listen>;

  beforeAll(async () => {
    server = app.listen(3001);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it('verifies the consumer contract against the real provider', async () => {
    const pactFile = path.resolve(process.cwd(), '../pact/pacts/reservation-consumer-inventory-provider.json');

    const verifier = new Verifier({
      provider: 'inventory-provider',
      providerBaseUrl: 'http://localhost:3001',
      pactUrls: [pactFile],
      stateHandlers: providerStates,
      logLevel: 'INFO',
    });

    await verifier.verifyProvider();
    expect(true).toBe(true);
  });
});
