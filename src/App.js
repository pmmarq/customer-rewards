import "./App.css";
import { useTransactions } from "./hooks/useTransactions";
import RewardsSummary from "./components/RewardsSummary";

function App() {
  const { transactions, loading, error } = useTransactions();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Customer Rewards Program</h1>
        <p className="subtitle">Points earned over the last 3 months</p>
      </header>

      <main className="App-main">
        {loading && <p className="status">Loading transactions...</p>}
        {error && <p className="status error">Error: {error}</p>}
        {!loading && !error && <RewardsSummary transactions={transactions} />}
      </main>
    </div>
  );
}

export default App;
