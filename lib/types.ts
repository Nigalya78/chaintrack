export type ChainType = "OT" | "MEDIUM";

export type DashboardData = {
  kanniStockLeft: number;
  kanniOtStockLeft: number;
  kanniMediumStockLeft: number;
  chainStock: number;
  chainOtStock: number;
  chainMediumStock: number;
  pendingWithLabour: number;
  pendingWithFinishing: number;
  pendingWithFinishingOt: number;
  pendingWithFinishingMedium: number;
  finishedChainStock: number;
  finishedChainOtStock: number;
  finishedChainMediumStock: number;
  monthlyRevenue: number;
  labourPending: LabourPendingItem[];
};

export type LabourPendingItem = {
  labourId: number;
  labourName: string;
  otPending: number;
  mediumPending: number;
};

export type Supplier = {
  id: number;
  name: string;
  phone: string;
  area?: string;
};

export type Labour = {
  id: number;
  name: string;
  phone: string;
  rateOT?: number;
  rateMedium?: number;
};

export type FinishingWorker = {
  id: number;
  name: string;
  phone: string;
  area?: string;
  rateOT?: number;
  rateMedium?: number;
  active: boolean;
};

export type Shop = {
  id: number;
  name: string;
  phone?: string;
  area?: string;
  rateOT?: number;
  rateMedium?: number;
  active: boolean;
};

export type RevenueItem = {
  year: number;
  month: number;
  revenue: number;
  labourAmount: number;
  purchaseAmount: number;
  finishingAmount: number;
  profit: number;
};

export type MonthlyRevenueData = {
  totalRevenue: number;
  currentMonthRevenue: number;
  monthlyBreakdown: RevenueItem[];
};

export type PurchaseTransaction = {
  id: number;
  supplierId: number;
  supplierName: string;
  chainType: ChainType;
  kilograms: string;
  packetCount: number;
  pricePerKg: string;
  totalCost: string;
  purchaseDate: string;
};

export type LabourTransaction = {
  id: number;
  labourId: number;
  labourName: string;
  chainType: ChainType;
  chainsGiven: number;
  chainsReceived: number;
  ratePerPiece?: number;
  amountGiven?: number;
  transactionDate: string;
  notes?: string;
};

export type FinishingTransaction = {
  id: number;
  finishingWorkerId: number;
  workerName: string;
  chainType: ChainType;
  chainsGiven: number;
  finishedChainsReceived: number;
  ratePerPiece?: number;
  transactionDate: string;
  notes?: string;
};

export type SaleTransaction = {
  id: number;
  shopName: string;
  chainType: ChainType;
  chainCount: number;
  pricePerChain: number;
  totalAmount: number;
  saleDate: string;
};
