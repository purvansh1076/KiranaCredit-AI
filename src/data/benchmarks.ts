/*
 * Deterministic synthetic benchmark merchants for KiranaCredit AI.
 * No Math.random(), Date.now(), or dynamic random values used.
 * Same code execution always produces the same data.
 */

// === Xorshift32 deterministic PRNG with fixed seed ===
let xorshiftState = 987654321;

function xorshift32(): number {
  xorshiftState ^= xorshiftState << 13;
  xorshiftState ^= xorshiftState >> 17;
  xorshiftState ^= xorshiftState << 5;
  return xorshiftState >>> 0;
}

function randInt(min: number, max: number): number {
  return min + (xorshift32() % (max - min + 1));
}

// Add days to a Date (deterministic, no Math.random() or Date.now())
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const BASE_DATE = new Date(2024, 0, 1);
const TRANSACTION_COUNT = 365;

// === Transaction type constants ===
const TX_TYPE_SALE = 'SALE';
const TX_TYPE_SUPPLIER_PAYMENT = 'SUPPLIER_PAYMENT';
const TX_TYPE_RENT = 'RENT';
const TX_TYPE_UTILITY = 'UTILITY';


// Payment methods
const PYM_UPI = 'UPI';
const PYM_CASH = 'CASH';
const PYM_BANK_TRANSFER = 'BANK_TRANSFER';

// Directions
const DIR_INFLOW = 'INFLOW';
const DIR_OUTFLOW = 'OUTFLOW';

// ============================================================
// HEALTHY MERCHANT: Ravi General Store
// ============================================================
// Characteristics: Consistent revenue, regular supplier payments,
// stable cash flow, digital transaction continuity improving.

// Base daily sales by month for healthy retailer (₹, weekday baseline)
const healthyBaseSales: number[] = [
  950, 900, 950, 980, 1000, 970, 1020, 1050, 1000, 1100, 1200, 1150
];

// Weekend multiplier (Sat/Sun vs weekday)
const HEALTHY_WEEKEND_MULT = 1.3;
// Diwali festival uplift (Oct, Nov)
const HEALTHY_DIWALI_MULT = 1.2;
// Monsoon slight dip
const HEALTHY_MONSOON_MULT = 0.95;

// Generate a single healthy sale transaction
function generateHealthySale(dayOfYear: number, txIndex: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  const date = addDays(BASE_DATE, dayOfYear);
  const month = date.getMonth(); // 0-11
  const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWeekend = dow === 0 || dow === 6;

  // Compute sales multiplier
  let saleMult = 1.0;
  if (isWeekend) saleMult *= HEALTHY_WEEKEND_MULT;
  if (month === 9 || month === 10) saleMult *= HEALTHY_DIWALI_MULT; // Oct, Nov
  if (month === 5) saleMult *= HEALTHY_MONSOON_MULT; // Jun

  // Deterministic ±8% variation
  const variation = 1 + (randInt(-8, 8) / 100);
  const saleAmount = Math.round(healthyBaseSales[month] * saleMult * variation);

  // Payment method: leaning UPI (70%), with gradual digital trend over time
  const baseUpiRatio = 70 + (txIndex % 365) * 0.1; // 70% → ~70.3% over year
  const adjustedUpi = baseUpiRatio <= 100 ? baseUpiRatio : 100;
  const isUPI = randInt(1, 100) <= adjustedUpi;
  const paymentMethod = isUPI ? PYM_UPI : PYM_CASH;

  const type = TX_TYPE_SALE;
  const category = 'Customer sale';
  const direction = DIR_INFLOW;
  const customerType = paymentMethod === PYM_UPI ? 'UPI customer' : 'Cash customer';
  const description = `${type} via ${paymentMethod} - ${customerType}`;

  return {
    id: `healthy-sale-${dayOfYear + 1}-${txIndex}`,
    date,
    type,
    category,
    amount: saleAmount,
    direction,
    paymentMethod,
    description,
  };
}

// Bi-weekly supplier payments for healthy merchant (26 per year)
// Days: 14, 28, 42, 56, 70, 84, 98, 112, 126, 140, 154, 168, 182, 196,
// 210, 224, 238, 252, 266, 280, 294, 308, 322, 336, 350, 364
function generateHealthySupplierPayment(dayOfYear: number, txIndex: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} | null {
  // Supplier payment day: i > 0 && i % 14 === 0
  if (dayOfYear > 0 && dayOfYear % 14 === 0) {
    const amount = 45000; // ₹45k per FMCG distributor payment
    return {
      id: `healthy-supplier-${dayOfYear}-${txIndex}`,
      date: addDays(BASE_DATE, dayOfYear),
      type: TX_TYPE_SUPPLIER_PAYMENT,
      category: 'FMCG distributor',
      amount,
      direction: DIR_OUTFLOW,
      paymentMethod: PYM_BANK_TRANSFER,
      description: `FMCG distributor payment - week ${(dayOfYear / 14) | 0}`,
    };
  }
  return null;
}

// Monthly rent for healthy merchant
function generateHealthyRent(month: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  const rentDate = addDays(BASE_DATE, month * 30 + 1); // ~1st of each month
  return {
    id: `healthy-rent-${month + 1}`,
    date: rentDate,
    type: TX_TYPE_RENT,
    category: 'Rent',
    amount: 50000,
    direction: DIR_OUTFLOW,
    paymentMethod: PYM_CASH,
    description: `Monthly rent payment - month ${month + 1}`,
  };
}

// Monthly utilities for healthy merchant
function generateHealthyUtility(month: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  // Utility base amounts by month (₹), higher in summer/monsoon
  const utilityBases: number[] = [4000, 4200, 4500, 5000, 5500, 6000, 6500, 7000, 6800, 5500, 4800, 4200];
  const base = utilityBases[month];

  // ±10% deterministic variation
  const variation = 1 + (randInt(-10, 10) / 100);
  const amount = Math.round(base * variation);

  // Mostly bank transfer for utilities, some cash
  const isBank = randInt(1, 100) <= 75;
  const paymentMethod = isBank ? PYM_BANK_TRANSFER : PYM_CASH;

  return {
    id: `healthy-utility-${month + 1}`,
    date: addDays(BASE_DATE, 1), // approximate month start
    type: TX_TYPE_UTILITY,
    category: 'Utilities',
    amount,
    direction: DIR_OUTFLOW,
    paymentMethod,
    description: `Utility payment - month ${month + 1}`,
  };
}

// Generate all transactions for healthy merchant
const healthyTransactions: Array<{
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
  merchantId: string;
}> = [];

for (let i = 0; i < TRANSACTION_COUNT; i++) {
  // First, check for supplier payment day (bi-weekly)
  const supPay = generateHealthySupplierPayment(i, i);
  if (supPay) {
    healthyTransactions.push({
      ...supPay,
      merchantId: 'ravi-general-store',
    });
    continue; // supplier payment replaces the regular sale for this day
  }

  // Regular sale transaction
  const tx = generateHealthySale(i, i);
  healthyTransactions.push({
    ...tx,
    merchantId: 'ravi-general-store',
  });

  // Add monthly rent (1st of each month)
  const month = Math.floor(i / 30); // approximate month
  if (i > 0 && i % 30 === 1 && month >= 0 && month < 12) {
    // Avoid duplicate if already added above, but rent days rarely coincide with supplier days
    const rent = generateHealthyRent(month);
    // Check if this day already has a transaction
    const alreadyExists = healthyTransactions.some(t => t.date.getTime() === rent.date.getTime());
    if (!alreadyExists) {
      healthyTransactions.push({
        ...rent,
        merchantId: 'ravi-general-store',
      });
    }
  }

  // Add monthly utility (1st of each month, approximate)
  const utilMonth = Math.floor(i / 30);
  if (i > 0 && i % 30 === 1 && utilMonth >= 0 && utilMonth < 12) {
    const util = generateHealthyUtility(utilMonth);
    const alreadyExists2 = healthyTransactions.some(t => t.date.getTime() === util.date.getTime());
    if (!alreadyExists2) {
      healthyTransactions.push({
        ...util,
        merchantId: 'ravi-general-store',
      });
    }
  }
}

// Healthy merchant profile
const healthyMerchant = {
  merchantId: 'ravi-general-store',
  name: 'Ravi General Store',
  location: 'Nagpur, Maharashtra, India',
  businessType: 'Neighborhood Kirana / FMCG retail',
  operatingHistoryYears: 10,
};

// ============================================================
// STRESSED MERCHANT: Sita Kirana Store
// ============================================================
// Characteristics: Inconsistent revenue, irregular supplier payments,
// cash flow pressure, seasonal volatility, payment delays.

// Base daily sales by month for stressed retailer (₹, lower baseline)
const stressedBaseSales: number[] = [
  600, 550, 700, 650, 680, 450, 500, 600, 580, 800, 950, 750
];

// Larger variation (±30%) built into the sale variation calculation
// Festival spike (Diwali Oct-Nov)
const STRESSED_DIWALI_MULT = 2.5;
// Cash pressure months (Feb, Jun, Aug)
const STRESSED_CASH_PRESSURE_MONTHS = [2, 5, 8]; // Feb, Jun, Aug
const STRESS_PRESSURE_MULT = 0.6;

// Generate a single stressed sale transaction
function generateStressedSale(dayOfYear: number, txIndex: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  const date = addDays(BASE_DATE, dayOfYear);
  const month = date.getMonth();

  // Significant variation ±30% from base
  const variation = 1 + (randInt(-30, 30) / 100); // 0.7 to 1.3

  // Festival spike during Diwali
  const isFestivalMonth = month === 9 || month === 10; // Oct, Nov
  const festivalMult = isFestivalMonth ? STRESSED_DIWALI_MULT : 1.0;

  // Cash flow pressure months (lower sales)
  const isCashPressureMonth = STRESSED_CASH_PRESSURE_MONTHS.includes(month);
  const pressureMult = isCashPressureMonth ? STRESS_PRESSURE_MULT : 1.0;

  // Inventory spike timing (causes temporary cash pressure)
  const hasInventorySpike = (txIndex % 90 === 20) || (txIndex % 90 === 50) || (txIndex % 90 === 80);
  const inventoryMult = hasInventorySpike && !isFestivalMonth ? 1.8 : 1.0;

  // Combined multiplier
  const saleMult = variation * festivalMult * inventoryMult * pressureMult;
  const saleAmount = Math.round(stressedBaseSales[month] * saleMult);

  // Payment method: more cash-dependent (60% cash, 40% UPI)
  const isUPI = randInt(1, 100) <= 40;
  const paymentMethod = isUPI ? PYM_UPI : PYM_CASH;

  const type = TX_TYPE_SALE;
  const category = 'Customer sale';
  const direction = DIR_INFLOW;
  const customerType = paymentMethod === PYM_UPI ? 'UPI customer' : 'Cash customer';
  const description = `${type} via ${paymentMethod} - ${customerType}`;

  return {
    id: `stressed-sale-${dayOfYear + 1}-${txIndex}`,
    date,
    type,
    category,
    amount: saleAmount,
    direction,
    paymentMethod,
    description,
  };
}

// Irregular supplier payments for stressed merchant
// ~40% probability per month, variable amounts, no strict schedule
function generateStressedSupplierPayment(dayOfYear: number, txIndex: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} | null {
  // ~40% chance per month roughly
  // Distribute across the year: higher probability before festival seasons
  const month = dayOfYear <= 33 ? 0 : dayOfYear <= 60 ? 1 : dayOfYear <= 91 ? 2 :
                dayOfYear <= 121 ? 3 : dayOfYear <= 152 ? 4 : dayOfYear <= 182 ? 5 :
                dayOfYear <= 213 ? 6 : dayOfYear <= 244 ? 7 : dayOfYear <= 274 ? 8 :
                dayOfYear <= 305 ? 9 : dayOfYear <= 335 ? 10 : 11;

  const monthlyProb = month === 9 || month === 10 ? 60 : 40; // higher before Diwali
  const hasPayment = randInt(1, 100) <= monthlyProb;

  if (hasPayment) {
    // Variable amounts: ₹25k-50k
    const supAmounts = [25000, 30000, 35000, 40000, 50000];
    const supIdx = randInt(0, supAmounts.length - 1);
    const amount = supAmounts[supIdx];

    return {
      id: `stressed-supplier-${dayOfYear}-${txIndex}`,
      date: addDays(BASE_DATE, dayOfYear),
      type: TX_TYPE_SUPPLIER_PAYMENT,
      category: 'FMCG distributor',
      amount,
      direction: DIR_OUTFLOW,
      paymentMethod: PYM_BANK_TRANSFER,
      description: `Irregular FMCG distributor payment - month ${month + 1}`,
    };
  }
  return null;
}

// Monthly rent for stressed merchant
function generateStressedRent(month: number): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  const rentDate = addDays(BASE_DATE, month * 30 + 1);
  return {
    id: `stressed-rent-${month + 1}`,
    date: rentDate,
    type: TX_TYPE_RENT,
    category: 'Rent',
    amount: 50000,
    direction: DIR_OUTFLOW,
    paymentMethod: PYM_CASH,
    description: `Monthly rent payment - month ${month + 1}`,
  };
}

// Generate all transactions for stressed merchant
const stressedTransactions: Array<{
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
  merchantId: string;
}> = [];

for (let i = 0; i < TRANSACTION_COUNT; i++) {
  // Check for irregular supplier payment first
  const supPay = generateStressedSupplierPayment(i, i);
  if (supPay) {
    stressedTransactions.push({
      ...supPay,
      merchantId: 'sita-kirana-store',
    });
    continue;
  }

  // Regular sale transaction
  const tx = generateStressedSale(i, i);
  stressedTransactions.push({
    ...tx,
    merchantId: 'sita-kirana-store',
  });

  // Add monthly rent
  const month = Math.floor(i / 30);
  if (i > 0 && i % 30 === 1 && month >= 0 && month < 12) {
    const rent = generateStressedRent(month);
    const alreadyExists = stressedTransactions.some(t => t.date.getTime() === rent.date.getTime());
    if (!alreadyExists) {
      stressedTransactions.push({
        ...rent,
        merchantId: 'sita-kirana-store',
      });
    }
  }
}

// Stressed merchant profile
const stressedMerchant = {
  merchantId: 'sita-kirana-store',
  name: 'Sita Kirana Store',
  location: 'Nagpur, Maharashtra, India',
  businessType: 'Neighborhood Kirana / FMCG retail',
  operatingHistoryYears: 5,
};

// ============================================================
// EXPORTS
// ============================================================

export {
  healthyTransactions,
  healthyMerchant,
  stressedTransactions,
  stressedMerchant,
  TRANSACTION_COUNT,
  BASE_DATE,
};