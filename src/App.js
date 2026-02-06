import { useState, useCallback, useMemo } from "react";
import "./App.css";
import { useTransactions } from "./hooks/useTransactions";
import Navigation from "./components/Navigation";
import RewardsSummary from "./components/RewardsSummary";
import Analytics from "./components/Analytics";
import Admin from "./components/Admin";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const { transactions: apiTransactions, loading, error } = useTransactions();
  const [activeTab, setActiveTab] = useState("Rewards");
  const [manualTransactions, setManualTransactions] = useState([]);

  const allTransactions = useMemo(() => {
    return [...apiTransactions, ...manualTransactions];
  }, [apiTransactions, manualTransactions]);

  // Pre-compute unique customers to avoid duplicate derivations in Admin/CustomerCombobox
  const uniqueCustomers = useMemo(() => {
    const customerMap = {};
    allTransactions.forEach((txn) => {
      if (!customerMap[txn.customerId]) {
        customerMap[txn.customerId] = {
          customerId: txn.customerId,
          name: txn.name,
          transactionCount: 0,
        };
      }
      customerMap[txn.customerId].transactionCount += 1;
    });
    return Object.values(customerMap).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [allTransactions]);

  const getNextId = useCallback(() => {
    const maxId = allTransactions.reduce(
      (max, txn) => Math.max(max, txn.id),
      0,
    );
    return maxId + 1;
  }, [allTransactions]);

  const handleAddTransaction = useCallback(
    (transaction) => {
      const newId = getNextId();
      setManualTransactions((prev) => [
        ...prev,
        { ...transaction, id: newId, isManual: true },
      ]);
    },
    [getNextId],
  );

  const handleUpdateTransaction = useCallback((id, updates) => {
    setManualTransactions((prev) =>
      prev.map((txn) => (txn.id === id ? { ...txn, ...updates } : txn)),
    );
  }, []);

  const handleDeleteTransaction = useCallback((id) => {
    setManualTransactions((prev) => prev.filter((txn) => txn.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-10 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Customer Rewards Program
          </h1>
          <p className="mt-2 text-indigo-200 text-base sm:text-lg">
            Points earned over the last 3 months
          </p>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div
            className="flex flex-col items-center justify-center py-20"
            role="status"
          >
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-slate-500 text-sm font-medium">
              Loading transactions...
            </p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        )}
        {!loading && !error && activeTab === "Rewards" && (
          <ErrorBoundary>
            <RewardsSummary transactions={allTransactions} />
          </ErrorBoundary>
        )}
        {!loading && !error && activeTab === "Analytics" && (
          <ErrorBoundary>
            <Analytics transactions={allTransactions} />
          </ErrorBoundary>
        )}
        {!loading && !error && activeTab === "Admin" && (
          <ErrorBoundary>
            <Admin
              transactions={allTransactions}
              uniqueCustomers={uniqueCustomers}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

export default App;
