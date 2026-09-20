import { InventoryClient, InventoryResponse, InventoryErrorResponse } from './inventoryClient.js';

export type ReservationDecision =
  | { kind: 'available'; inventory: InventoryResponse }
  | { kind: 'out_of_stock'; inventory: InventoryResponse }
  | { kind: 'not_found'; error: InventoryErrorResponse };

export class ReservationService {
  constructor(private readonly client: InventoryClient) {}

  async checkReservationEligibility(sku: string): Promise<ReservationDecision> {
    const result = await this.client.getInventory(sku);

    if ('code' in result) {
      return {
        kind: 'not_found',
        error: result,
      };
    }

    if (result.availableQuantity <= 0) {
      return {
        kind: 'out_of_stock',
        inventory: result,
      };
    }

    return {
      kind: 'available',
      inventory: result,
    };
  }
}
