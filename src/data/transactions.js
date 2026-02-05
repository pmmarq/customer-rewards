/**
 * Mock transaction data spanning three months (October - December 2024)
 * for five customers, demonstrating a variety of purchase amounts
 * to exercise every branch of the rewards calculation.
 */
const transactions = [
  // ── Alice Johnson ──────────────────────────────────────────
  { id: 1,  customerId: 1, name: 'Alice Johnson',  date: '2024-10-05', amount: 120.00 },
  { id: 2,  customerId: 1, name: 'Alice Johnson',  date: '2024-10-18', amount: 75.50  },
  { id: 3,  customerId: 1, name: 'Alice Johnson',  date: '2024-11-02', amount: 200.00 },
  { id: 4,  customerId: 1, name: 'Alice Johnson',  date: '2024-11-25', amount: 50.00  },
  { id: 5,  customerId: 1, name: 'Alice Johnson',  date: '2024-12-10', amount: 300.00 },
  { id: 6,  customerId: 1, name: 'Alice Johnson',  date: '2024-12-22', amount: 45.00  },

  // ── Bob Smith ──────────────────────────────────────────────
  { id: 7,  customerId: 2, name: 'Bob Smith',       date: '2024-10-12', amount: 50.00  },
  { id: 8,  customerId: 2, name: 'Bob Smith',       date: '2024-10-28', amount: 150.00 },
  { id: 9,  customerId: 2, name: 'Bob Smith',       date: '2024-11-15', amount: 90.00  },
  { id: 10, customerId: 2, name: 'Bob Smith',       date: '2024-11-30', amount: 110.00 },
  { id: 11, customerId: 2, name: 'Bob Smith',       date: '2024-12-05', amount: 60.00  },
  { id: 12, customerId: 2, name: 'Bob Smith',       date: '2024-12-20', amount: 250.00 },

  // ── Carol Davis ────────────────────────────────────────────
  { id: 13, customerId: 3, name: 'Carol Davis',     date: '2024-10-03', amount: 210.00 },
  { id: 14, customerId: 3, name: 'Carol Davis',     date: '2024-10-22', amount: 35.00  },
  { id: 15, customerId: 3, name: 'Carol Davis',     date: '2024-11-08', amount: 100.00 },
  { id: 16, customerId: 3, name: 'Carol Davis',     date: '2024-11-19', amount: 175.00 },
  { id: 17, customerId: 3, name: 'Carol Davis',     date: '2024-12-01', amount: 80.00  },
  { id: 18, customerId: 3, name: 'Carol Davis',     date: '2024-12-15', amount: 130.00 },

  // ── David Wilson ───────────────────────────────────────────
  { id: 19, customerId: 4, name: 'David Wilson',    date: '2024-10-10', amount: 95.00  },
  { id: 20, customerId: 4, name: 'David Wilson',    date: '2024-10-30', amount: 400.00 },
  { id: 21, customerId: 4, name: 'David Wilson',    date: '2024-11-12', amount: 55.00  },
  { id: 22, customerId: 4, name: 'David Wilson',    date: '2024-11-28', amount: 120.00 },
  { id: 23, customerId: 4, name: 'David Wilson',    date: '2024-12-08', amount: 30.00  },
  { id: 24, customerId: 4, name: 'David Wilson',    date: '2024-12-25', amount: 500.00 },

  // ── Eva Martinez ───────────────────────────────────────────
  { id: 25, customerId: 5, name: 'Eva Martinez',    date: '2024-10-07', amount: 101.00 },
  { id: 26, customerId: 5, name: 'Eva Martinez',    date: '2024-10-20', amount: 49.99  },
  { id: 27, customerId: 5, name: 'Eva Martinez',    date: '2024-11-05', amount: 250.00 },
  { id: 28, customerId: 5, name: 'Eva Martinez',    date: '2024-11-22', amount: 75.00  },
  { id: 29, customerId: 5, name: 'Eva Martinez',    date: '2024-12-03', amount: 180.00 },
  { id: 30, customerId: 5, name: 'Eva Martinez',    date: '2024-12-18', amount: 100.00 },
];

export default transactions;
