// Initial state shape
const initialState = {
  entities: {
    customers: {},
    transactions: {}
  },
  result: {
    allTransactionIds: [],
    customerTransactionIds: {},
    monthlyTransactions: {}
  },
  ui: {
    loading: false,
    error: null,
    selectedCustomer: null
  }
};

/**
 * Normalizes transaction data for efficient state management
 * Prevents data duplication and enables memoization
 */
export function normalizeTransactions(transactions) {
  const state = JSON.parse(JSON.stringify(initialState));
  
  // Process each transaction
  transactions.forEach(txn => {
    // Normalize transaction
    state.entities.transactions[txn.id] = txn;
    
    // Normalize customer if not exists
    if (!state.entities.customers[txn.customerId]) {
      state.entities.customers[txn.customerId] = {
        id: txn.customerId,
        name: txn.name,
        totalPoints: 0,
        totalSpent: 0,
        transactionIds: []
      };
    }
    
    // Add transaction ID to customer
    const customer = state.entities.customers[txn.customerId];
    if (!customer.transactionIds.includes(txn.id)) {
      customer.transactionIds.push(txn.id);
    }
    
    // Update customer totals (expensive calculations moved here)
    const points = calculateTransactionPoints(txn.amount);
    customer.totalPoints += points;
    customer.totalSpent += txn.amount;
    
    // Add to result arrays
    if (!state.result.allTransactionIds.includes(txn.id)) {
      state.result.allTransactionIds.push(txn.id);
    }
    
    if (!state.result.customerTransactionIds[txn.customerId]) {
      state.result.customerTransactionIds[txn.customerId] = [];
    }
    state.result.customerTransactionIds[txn.customerId].push(txn.id);
    
    // Monthly grouping
    const month = new Date(txn.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
    
    if (!state.result.monthlyTransactions[month]) {
      state.result.monthlyTransactions[month] = [];
    }
    state.result.monthlyTransactions[month].push(txn.id);
  });
  
  return state;
}

// Simple points calculation to avoid import for demo
function calculateTransactionPoints(amount) {
  const dollars = Math.floor(amount);
  let points = 0;
  
  if (dollars > 100) {
    points += 2 * (dollars - 100);
  }
  
  if (dollars > 50) {
    points += Math.min(dollars, 100) - 50;
  }
  
  return points;
}

/**
 * Transaction reducer for state management
 * Handles all transaction-related state updates efficiently
 */
export function transactionReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOAD_TRANSACTIONS_START':
      return {
        ...state,
        ui: { ...state.ui, loading: true, error: null }
      };
      
    case 'LOAD_TRANSACTIONS_SUCCESS':
      return normalizeTransactions(action.payload);
      
    case 'LOAD_TRANSACTIONS_ERROR':
      return {
        ...state,
        ui: { ...state.ui, loading: false, error: action.payload }
      };
      
    case 'ADD_TRANSACTION':
      return normalizeTransactions([...state.result.allTransactionIds.map(id => state.entities.transactions[id]), action.payload]);
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        entities: {
          ...state.entities,
          transactions: {
            ...state.entities.transactions,
            [action.payload.id]: {
              ...state.entities.transactions[action.payload.id],
              ...action.payload.updates
            }
          }
        }
      }
      };
      
    case 'DELETE_TRANSACTION':
      const deletedTxn = state.entities.transactions[action.payload.id];
      const newState = { ...state };
      
      // Remove from entities
      delete newState.entities.transactions[action.payload.id];
      
      // Remove from result arrays
      newState.result.allTransactionIds = newState.result.allTransactionIds.filter(id => id !== action.payload.id);
      
      // Update customer data
      const customer = newState.entities.customers[deletedTxn.customerId];
      if (customer) {
        customer.transactionIds = customer.transactionIds.filter(id => id !== action.payload.id);
        // Recalculate totals (would be memoized in production)
        customer.totalPoints -= calculateTransactionPoints(deletedTxn.amount);
        customer.totalSpent -= deletedTxn.amount;
      }
      
      return newState;
      
    case 'SELECT_CUSTOMER':
      return {
        ...state,
        ui: { ...state.ui, selectedCustomer: action.payload }
      };
      
    default:
      return state;
  }
}