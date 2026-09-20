export type InventoryStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'NOT_FOUND';

export interface InventoryResponse {
  sku: string;
  name: string;
  availableQuantity: number;
  status: InventoryStatus;
  price: number;
}

export interface InventoryErrorResponse {
  code: string;
  message: string;
}

export class InventoryClient {
  constructor(private readonly baseUrl: string) {}

  async getInventory(sku: string): Promise<InventoryResponse | InventoryErrorResponse> {
    const response = await fetch(`${this.baseUrl}/inventory/${sku}`);

    const payload = await response.json().catch(() => ({}));

    if (response.status === 404) {
      return {
        code: 'SKU_NOT_FOUND',
        message: `SKU ${sku} not found`,
      };
    }

    if (!response.ok) {
      return {
        code: 'UNKNOWN_ERROR',
        message: payload?.message ?? 'Unexpected error',
      };
    }

    return payload as InventoryResponse;
  }
}
