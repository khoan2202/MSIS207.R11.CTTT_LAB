export interface Reservation {
  token: string;
  expiresAt: number;
}

export interface Order {
  id: string;
  token: string;
  createdAt: number;
}

export interface InventorySnapshot {
  total: number;
  available: number;
  reserved: number;
  sold: number;
}

export type SaleState =
  | { status: "IDLE" }
  | { status: "RESERVING" }
  | { status: "RESERVED"; reservation: Reservation }
  | { status: "CHECKING_OUT"; reservation: Reservation }
  | { status: "SUCCESS"; order: Order }
  | { status: "EXPIRED"; message: string }
  | { status: "ERROR"; message: string };