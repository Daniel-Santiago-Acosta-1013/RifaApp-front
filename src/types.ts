export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type Raffle = {
  id: string;
  title: string;
  description?: string | null;
  ticket_price: string;
  currency: string;
  total_tickets: number;
  tickets_sold: number;
  status: string;
  draw_at?: string | null;
  winner_ticket_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type RaffleCreate = {
  title: string;
  description?: string;
  ticket_price: number;
  currency: string;
  total_tickets: number;
  draw_at?: string;
};

export type TicketPurchaseRequest = {
  participant: {
    name: string;
    email?: string;
  };
  quantity: number;
};

export type TicketPurchaseResponse = {
  raffle_id: string;
  participant_id: string;
  ticket_ids: string[];
  numbers: number[];
  total_price: string;
  currency: string;
};
