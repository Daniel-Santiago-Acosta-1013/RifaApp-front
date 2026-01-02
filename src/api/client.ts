import type { Raffle, RaffleCreate, TicketPurchaseRequest, TicketPurchaseResponse, User } from "../types";

const DEFAULT_API_BASE = "http://localhost:8000/rifaapp";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const parseError = async (response: Response): Promise<string> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await response.json();
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    return JSON.stringify(data);
  }
  return response.text();
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(message || "Request failed", response.status);
  }

  return response.json() as Promise<T>;
};

export const listRaffles = (status?: string) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<Raffle[]>(`/raffles${query}`);
};

export const getRaffle = (id: string) => request<Raffle>(`/raffles/${id}`);

export const createRaffle = (payload: RaffleCreate) =>
  request<Raffle>("/raffles", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const purchaseTickets = (raffleId: string, payload: TicketPurchaseRequest) =>
  request<TicketPurchaseResponse>(`/raffles/${raffleId}/tickets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const registerUser = (payload: { name: string; email: string; password: string }) =>
  request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload: { email: string; password: string }) =>
  request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export { ApiError };
