export type InventoryStatus = 'AVAILABLE' | 'OUT_OF_STOCK';

export interface InventoryItem {
  sku: string;
  name: string;
  availableQuantity: number;
  price: number;
  status: InventoryStatus;
}

export class InventoryStore {
  private readonly items: Map<string, InventoryItem> = new Map([
    ['A100', { sku: 'A100', name: 'Laptop Ultra', availableQuantity: 8, price: 1200, status: 'AVAILABLE' }],
    ['B200', { sku: 'B200', name: 'Mouse Pro', availableQuantity: 0, price: 45, status: 'OUT_OF_STOCK' }],
  ]);

  getItemBySku(sku: string): InventoryItem | undefined {
    return this.items.get(sku);
  }
}
