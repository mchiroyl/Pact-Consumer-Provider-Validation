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
    server = app.listen(0);

    await new Promise<void>((resolve, reject) => {
      server.once('listening', () => resolve());
      server.once('error', (err) => reject(err));
    });
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
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Provider server did not bind to a TCP port.');
    }

    const verifier = new Verifier({
      provider: 'inventory-provider',
      providerBaseUrl: `http://localhost:${address.port}`,
      pactUrls: [pactFile],
      stateHandlers: providerStates,
      logLevel: 'INFO',
    });

    await verifier.verifyProvider();
    expect(true).toBe(true);
  });
});
