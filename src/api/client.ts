import type {
  Purchase,
  PurchaseConfirmRequest,
  PurchaseConfirmResponse,
  RaffleCreateV2,
  RaffleNumbersResponse,
  RaffleV2,
  ReservationRequest,
  ReservationResponse,
  User,
} from "../types";

const DEFAULT_API_BASE = "http://localhost:8000/rifaapp";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");
const API_V2_PREFIX = API_BASE_URL.includes("/v2/") ? "" : "/v2";
const v2Path = (path: string) => `${API_V2_PREFIX}${path}`;

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
    if (typeof data?.detail?.message === "string") {
      return data.detail.message;
    }
    return JSON.stringify(data);
  }
  return response.text();
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(message || "Request failed", response.status);
  }

  return response.json() as Promise<T>;
};

export const listRafflesV2 = (status?: string) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<RaffleV2[]>(v2Path(`/raffles${query}`));
};

export const getRaffleV2 = (id: string) => request<RaffleV2>(v2Path(`/raffles/${id}`));

export const createRaffleV2 = (payload: RaffleCreateV2) =>
  request<RaffleV2>(v2Path("/raffles"), {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getRaffleNumbers = (raffleId: string, offset = 0, limit?: number) => {
  const query = new URLSearchParams();
  if (offset) {
    query.set("offset", String(offset));
  }
  if (limit) {
    query.set("limit", String(limit));
  }
  const suffix = query.toString();
  return request<RaffleNumbersResponse>(
    v2Path(`/raffles/${raffleId}/numbers${suffix ? `?${suffix}` : ""}`),
  );
};

export const reserveNumbers = (raffleId: string, payload: ReservationRequest) =>
  request<ReservationResponse>(v2Path(`/raffles/${raffleId}/reservations`), {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const confirmPurchase = (raffleId: string, payload: PurchaseConfirmRequest) =>
  request<PurchaseConfirmResponse>(v2Path(`/raffles/${raffleId}/confirm`), {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const releaseReservation = (raffleId: string, reservation_id: string) =>
  request<{ status: string; released: number }>(v2Path(`/raffles/${raffleId}/release`), {
    method: "POST",
    body: JSON.stringify({ reservation_id }),
  });

export const listPurchases = (participantId: string) =>
  request<Purchase[]>(v2Path(`/participants/${participantId}/purchases`));

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
