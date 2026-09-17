export type TransactionType =
  | 'SALE'
  | 'SUPPLIER_PAYMENT'
  | 'INVENTORY_PURCHASE'
  | 'RENT'
  | 'UTILITY'
  | 'OPERATING_EXPENSE'
  | 'DEBT_REPAYMENT'
  | 'CASH_DEPOSIT';

export type PaymentMethod = 'UPI' | 'CASH' | 'BANK_TRANSFER';

export type TransactionDirection = 'INFLOW' | 'OUTFLOW';

export const enum TransactionDirectionConst {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  category: string;
  amount: number;
  direction: TransactionDirection;
  paymentMethod: PaymentMethod;
  description: string;
  merchantId: string;
}

export interface MerchantProfile {
  merchantId: string;
  name: string;
  location: string;
  businessType: string;
  operatingHistoryYears: number;
}