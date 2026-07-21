import type {
  DashboardData,
  FinishingTransaction,
  FinishingWorker,
  Labour,
  LabourTransaction,
  MonthlyRevenueData,
  PurchaseTransaction,
  SaleTransaction,
  Shop,
  Supplier,
} from "./types";

const API_BASE = "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  getDashboard: () => request<DashboardData>("/api/dashboard"),
  getMonthlyRevenue: () => request<MonthlyRevenueData>("/api/monthly-revenue"),
  listSuppliers: () => request<Supplier[]>("/api/suppliers"),
  createSupplier: (body: { name: string; phone: string; area?: string }) =>
    request<Supplier>("/api/suppliers", { method: "POST", body: JSON.stringify(body) }),
  updateSupplier: (id: number, body: { name: string; phone: string; area?: string }) =>
    request<Supplier>(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  listPurchases: () => request<PurchaseTransaction[]>("/api/purchases"),
  createPurchase: (body: {
    supplierId: number;
    chainType: "OT" | "MEDIUM";
    kilograms: number;
    pricePerKg: number;
    purchaseDate: string;
  }) => request("/api/purchases", { method: "POST", body: JSON.stringify(body) }),
  listShops: () => request<Shop[]>("/api/shops"),
  createShop: (body: { name: string; phone?: string; area?: string; rateOT?: number; rateMedium?: number }) =>
    request<Shop>("/api/shops", { method: "POST", body: JSON.stringify(body) }),
  updateShop: (id: number, body: { name: string; phone?: string; area?: string; rateOT?: number; rateMedium?: number }) =>
    request<Shop>(`/api/shops/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  listLabours: () => request<Labour[]>("/api/labour"),
  createLabour: (body: { name: string; phone: string; rateOT?: number; rateMedium?: number }) =>
    request<Labour>("/api/labour", { method: "POST", body: JSON.stringify(body) }),
  updateLabour: (id: number, body: { name: string; phone: string; rateOT?: number; rateMedium?: number }) =>
    request<Labour>(`/api/labour/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  listLabourTransactions: () => request<LabourTransaction[]>("/api/labour-transactions"),
  createLabourTransaction: (body: {
    labourId: number;
    chainType: "OT" | "MEDIUM";
    chainsGiven: number;
    chainsReceived: number;
    transactionDate: string;
    notes?: string;
  }) => request("/api/labour-transactions", { method: "POST", body: JSON.stringify(body) }),
  listFinishingTransactions: () => request<FinishingTransaction[]>("/api/finishing-transactions"),
  createFinishingTransaction: (body: {
    finishingWorkerId: number;
    chainType: "OT" | "MEDIUM";
    chainsGiven: number;
    finishedChainsReceived: number;
    ratePerPiece?: number;
    transactionDate: string;
    notes?: string;
  }) => request("/api/finishing-transactions", { method: "POST", body: JSON.stringify(body) }),
  listFinishingWorkers: () => request<FinishingWorker[]>("/api/finishing-workers"),
  createFinishingWorker: (body: {
    name: string;
    phone: string;
    area?: string;
    rateOT?: number;
    rateMedium?: number;
  }) => request<FinishingWorker>("/api/finishing-workers", { method: "POST", body: JSON.stringify(body) }),
  updateFinishingWorker: (id: number, body: {
    name: string;
    phone: string;
    area?: string;
    rateOT?: number;
    rateMedium?: number;
  }) => request<FinishingWorker>(`/api/finishing-workers/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  listSales: () => request<SaleTransaction[]>("/api/sales"),
  createSale: (body: {
    shopId: number;
    chainType: "OT" | "MEDIUM";
    chainCount: number;
    pricePerChain: number;
    saleDate: string;
  }) => request("/api/sales", { method: "POST", body: JSON.stringify(body) }),
};
