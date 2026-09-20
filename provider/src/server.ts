import express from 'express';
import { InventoryStore } from './inventoryStore.js';

export function createProviderApp() {
  const app = express();
  const inventoryStore = new InventoryStore();

  app.get('/inventory/:sku', (req, res) => {
    const { sku } = req.params;
    const item = inventoryStore.getItemBySku(sku);

    if (!item) {
      return res.status(404).json({
        code: 'SKU_NOT_FOUND',
        message: `SKU ${sku} not found`,
      });
    }

    return res.status(200).json({
      sku: item.sku,
      name: item.name,
      availableQuantity: item.availableQuantity,
      price: item.price,
      status: item.status,
    });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const app = createProviderApp();
  app.listen(3001, () => {
    console.log('Provider running on http://localhost:3001');
  });
}
