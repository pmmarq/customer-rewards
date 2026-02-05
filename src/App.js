import "./App.css";
import { useTransactions } from "./hooks/useTransactions";
import RewardsSummary from "./components/RewardsSummary";

function App() {
  const { transactions, loading, error } = useTransactions();

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
        {!loading && !error && <RewardsSummary transactions={transactions} />}
      </main>
    </div>
  );
}

export default App;
