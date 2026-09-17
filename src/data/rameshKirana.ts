/*
 * Deterministic synthetic financial data for Ramesh Kirana Store.
 * No Math.random(), Date.now(), or dynamic random values used.
 * Same code execution always produces the same data.
 */

// === Xorshift32 deterministic PRNG with fixed seed ===
// Period: 2^32 - 1, full cycle. Fixed seed ensures reproducibility.
let xorshiftState = 123456789;

function xorshift32(): number {
  // xorshift32 algorithm with fixed state
  xorshiftState ^= xorshiftState << 13;
  xorshiftState ^= xorshiftState >> 17;
  xorshiftState ^= xorshiftState << 5;
  return xorshiftState >>> 0; // unsigned 32-bit
}

// Add days to a Date (deterministic, no Date.now() or Math.random())
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday
function dayOfWeek(date: Date): number {
  const dow = date.getDay();
  return dow; // 0=Sun, 1=Mon, ..., 6=Sat
}

// Month index: 0=January, 1=February, ..., 11=December
function monthIndex(date: Date): number {
  return date.getMonth();
}

// === Base date: January 1, 2024 ===
const BASE_DATE = new Date(2024, 0, 1);

// Transaction count: 365 (one per day, covering exactly 12 months)
const TRANSACTION_COUNT = 365;

// === Business pattern constants (₹ amounts) ===

// Base daily sales by month (weekday baseline, in ₹)
// Indices: 0=Jan, 1=Feb, ..., 11=Dec
const baseDailySales: number[] = [
  800, // Jan - post-holiday
  750, // Feb
  850, // Mar - Holi uplift
  880, // Apr
  900, // May
  820, // Jun - monsoon dip
  830, // Jul
  870, // Aug
  900, // Sep
  1100, // Oct - Diwali prep
  1250, // Nov - Diwali
  1000, // Dec - year-end
];

// Weekend sales multiplier (Sat/Sun vs weekday)
const WEEKEND_MULTIPLIER = 1.8;

// Festival/Diwali uplift applied on top of base
const DIWALI_UPLIFT = 1.4; // Nov has both base+uplift, Oct has prep uplift

// Supplier payment constants
const SUPPLIER_PAYMENT_AMOUNT = 45000; // ₹45k per FMCG distributor payment
const SUPPLIER_FREQUENCY_DAYS = 14; // bi-weekly

// Inventory purchase amounts (₹) - three inventory purchases
const INVENTORY_AMOUNTS = [180000, 220000, 150000];

// Inventory purchase months (0-indexed: 0=Jan)
// Aug=7, Sep=9, Oct=10 (before festival season)
const INVENTORY_MONTHS = [7, 9, 10];

// Rent
const RENT_AMOUNT = 50000;

// Utilities base amounts by month (₹), varying by season (higher summer/monsoon)
const UTILITY_BASE_AMOUNTS = [4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 7000, 6000, 5000, 4500];

// Debt repayment amounts (₹) - 2 per year
const DEBT_REPAYMENT_AMOUNTS = [20000, 15000];

// Cash deposit occurrences (₹) - 1 per year
const CASH_DEPOSIT_AMOUNT = 100000;

// UPI/Cash mix for sales
const UPI_PROBABILITY = 65; // 65% UPI, 35% Cash for sales

// === Generate a single transaction deterministically ===
function generateTransaction(
  dayOfYear: number,
  txIndex: number
): {
  id: string;
  date: Date;
  type: string;
  category: string;
  amount: number;
  direction: string;
  paymentMethod: string;
  description: string;
} {
  // Compute the actual date from day-of-year
  // dayOfYear 0 = Jan 1, 364 = Dec 31
  const date = addDays(BASE_DATE, dayOfYear);

  // Derive month and day-of-week from the date
  const month = monthIndex(date); // 0-11
  const dow = dayOfWeek(date); // 0=Sun, 1=Mon, ..., 6=Sat
  const isWeekend = dow === 0 || dow === 6; // Sat or Sun

  // ---- Determine transaction type based on day-of-year patterns ----

  // Priority order: supplier payment > inventory > rent > utility > debt > cash deposit > sale
  let type: string;
  let category: string;
  let amount: number;
  let direction: string;
  let paymentMethod: string;
  let description: string;

  // First, check if this is a supplier payment day (bi-weekly from Jan 1)
  // Supplier payments on days: 14, 28, 42, 56, 70, 84, 98, 112, 126, 140, 154, ...
  const isSupplierPaymentDay = dayOfYear > 0 && dayOfYear % SUPPLIER_FREQUENCY_DAYS === 0;

  if (isSupplierPaymentDay) {
    type = 'SUPPLIER_PAYMENT';
    category = 'FMCG distributor';
    amount = SUPPLIER_PAYMENT_AMOUNT;
    direction = 'OUTFLOW';
    paymentMethod = 'BANK_TRANSFER';
    description = 'FMCG distributor payment - customer purchase';
  } else {
    // Check if this is an inventory purchase month
    const isInventoryMonth = INVENTORY_MONTHS.includes(month);
    const inventoryChance = isInventoryMonth ? (xorshift32() % 5) : 0; // ~20% chance in inventory months
    const isInventoryPurchaseDay = isInventoryMonth && inventoryChance < 1;

    if (isInventoryPurchaseDay) {
      const inventoryIdx = INVENTORY_MONTHS.findIndex(m => m === month);
      const invAmount = INVENTORY_AMOUNTS[inventoryIdx] || 200000;
      type = 'INVENTORY_PURCHASE';
      category = 'Inventory';
      amount = invAmount;
      direction = 'OUTFLOW';
      // Payment method: CASH or BANK_TRANSFER
      const invPayChance = xorshift32() % 100;
      paymentMethod = invPayChance > 70 ? 'CASH' : 'BANK_TRANSFER';
      description = 'Inventory restock - customer purchase';
    } else {
      // Check if this is a rent day (1st of each month)
      const dayOfMonthCheck = addDays(BASE_DATE, dayOfYear).getDate();
      const isRent1st = dayOfMonthCheck === 1;

      if (isRent1st) {
        type = 'RENT';
        category = 'Rent';
        amount = RENT_AMOUNT;
        direction = 'OUTFLOW';
        paymentMethod = 'CASH';
        description = 'Monthly rent payment - customer purchase';
      } else {
        // Check if this is a utility payment day (1st of each month)
        const dayOfMonthCheck2 = addDays(BASE_DATE, dayOfYear).getDate();
        const isUtility1st = dayOfMonthCheck2 === 1;

        if (isUtility1st) {
          type = 'UTILITY';
          category = 'Utilities';
          // Varying utility amounts by month (higher in summer months Apr-Jul, monsoon Aug, lower otherwise)
          const utilityBase = UTILITY_BASE_AMOUNTS[month];

          // Deterministic ±15% variation
          const seasonalVariation = (xorshift32() % 300) / 100; // 0-30% variation
          let utilAmount: number;
          if (month >= 3 && month <= 7) { // Apr-Jul (summer), also Aug (monsoon)
            utilAmount = utilityBase * (1 + seasonalVariation / 10);
          } else {
            utilAmount = utilityBase * (1 - seasonalVariation / 10);
          }
          amount = Math.round(utilAmount);
          direction = 'OUTFLOW';
          // Payment method: mostly bank transfer, some cash
          const utilPayChance = xorshift32() % 100;
          paymentMethod = utilPayChance > 70 ? 'BANK_TRANSFER' : 'CASH';
          description = 'Utility payment - customer purchase';
        } else {
          // Check if this is a debt repayment day (deterministic positions)
          // Roughly quarterly: around day 90, 180
          const isDebtRepaymentDay = (dayOfYear % 90 === 30) || (dayOfYear % 90 === 60);

          if (isDebtRepaymentDay) {
            type = 'DEBT_REPAYMENT';
            category = 'Debt';
            amount = DEBT_REPAYMENT_AMOUNTS[0]; // simplified: always first amount
            direction = 'OUTFLOW';
            paymentMethod = 'BANK_TRANSFER';
            description = 'Debt repayment - customer purchase';
          } else {
            // Check if this is a cash deposit day
            const isCashDepositDay = dayOfYear === 30; // end of Jan, for example

            if (isCashDepositDay) {
              type = 'CASH_DEPOSIT';
              category = 'Cash deposit';
              amount = CASH_DEPOSIT_AMOUNT;
              direction = 'INFLOW';
              paymentMethod = 'CASH';
              description = 'Cash deposit - customer purchase';
            } else {
              // Regular sale transaction
              // Determine if weekend or weekday affects base sales
              const baseSale = baseDailySales[month];

              // Weekend multiplier
              const weekendMult = isWeekend ? WEEKEND_MULTIPLIER : 1.0;

              // Diwali period uplift (Oct and Nov)
              const diwaliMult = (month === 9 || month === 10) ? DIWALI_UPLIFT : 1.0;

              // Monsoon dip (June)
              const monsoonMult = month === 5 ? 0.9 : 1.0;

              // Combined multiplier
              const multiplier = weekendMult * diwaliMult * monsoonMult;

              // Deterministic variation (±15%) based on txIndex
              const variation = 1 + ((xorshift32() % 31) - 15) / 100; // 0.85 to 1.15

              const saleAmount = Math.round(baseSale * multiplier * variation);

              type = 'SALE';
              category = 'Customer sale';
              amount = saleAmount;
              direction = 'INFLOW';

              // Payment method: UPI or Cash
              const isUPI = (xorshift32() % 100) + 1 <= UPI_PROBABILITY; // 65% chance
              paymentMethod = isUPI ? 'UPI' : 'CASH';

              const customerType = isUPI ? 'UPI customer' : 'Cash customer';
              description = `SALE via ${paymentMethod} - ${customerType} - customer purchase`;
            }
          }
        }
      }
    }
  }

  // Generate a deterministic ID
  const id = `tx-${dayOfYear + 1}-${txIndex}`;

  return {
    id,
    date,
    type,
    category,
    amount,
    direction,
    paymentMethod,
    description,
  };
}

// === Generate all transactions for Ramesh Kirana Store ===
const rameshTransactions: Array<{
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
  const tx = generateTransaction(i, i);
  rameshTransactions.push({
    ...tx,
    merchantId: 'ramesh-kirana-store',
  });
}

// === Merchant profile ===
const rameshMerchant = {
  merchantId: 'ramesh-kirana-store',
  name: 'Ramesh Kirana Store',
  location: 'Nagpur, Maharashtra, India',
  businessType: 'Neighborhood Kirana / FMCG retail',
  operatingHistoryYears: 8,
};

// Export
export { rameshTransactions, rameshMerchant };