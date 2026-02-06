import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { calculatePoints } from "../utils/calculatePoints";
import CustomerCombobox from "./CustomerCombobox";

function Admin({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    amount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Get unique customers with transaction counts
  const uniqueCustomers = useMemo(() => {
    const customerMap = {};
    transactions.forEach((txn) => {
      if (!customerMap[txn.customerId]) {
        customerMap[txn.customerId] = {
          customerId: txn.customerId,
          name: txn.name,
          transactionCount: 0,
        };
      }
      customerMap[txn.customerId].transactionCount += 1;
    });
    return Object.values(customerMap);
  }, [transactions]);

  // Check if current name matches an existing customer
  const existingCustomer = useMemo(() => {
    if (!formData.name.trim()) return null;
    return uniqueCustomers.find(
      (c) => c.name.toLowerCase() === formData.name.trim().toLowerCase(),
    );
  }, [uniqueCustomers, formData.name]);

  const isNewCustomer = formData.name.trim() && !existingCustomer;

  const getCustomerId = (name) => {
    const trimmedName = name.trim().toLowerCase();
    const existing = transactions.find(
      (txn) => txn.name.toLowerCase() === trimmedName,
    );
    if (existing) {
      return existing.customerId;
    }
    const maxCustomerId = transactions.reduce(
      (max, txn) => Math.max(max, txn.customerId),
      0,
    );
    return maxCustomerId + 1;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (
      !formData.amount ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      newErrors.amount = "Valid positive amount is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const name = formData.name.trim();
    const transaction = {
      customerId: getCustomerId(name),
      name,
      date: formData.date,
      amount: Number(formData.amount),
    };

    if (editingId !== null) {
      onUpdateTransaction(editingId, transaction);
      setEditingId(null);
    } else {
      onAddTransaction(transaction);
    }

    setFormData({ name: "", date: "", amount: "" });
    setErrors({});
  };

  const handleEdit = (txn) => {
    setFormData({
      name: txn.name,
      date: txn.date,
      amount: String(txn.amount),
    });
    setEditingId(txn.id);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", date: "", amount: "" });
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = (id) => {
    if (editingId === id) {
      handleCancelEdit();
    }
    onDeleteTransaction(id);
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [transactions]);

  const manualTransactions = useMemo(() => {
    return sortedTransactions.filter((txn) => txn.isManual);
  }, [sortedTransactions]);

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {editingId !== null ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <CustomerCombobox
                customers={transactions}
                value={formData.name}
                onChange={(name) => setFormData({ ...formData, name })}
                error={errors.name}
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Transaction Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.date ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Amount ($)
              </label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.amount ? "border-red-500" : "border-slate-300"
                }`}
                placeholder="e.g., 150.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Confirmation Summary - Feature #4 */}
          {formData.name.trim() &&
            formData.date &&
            formData.amount &&
            editingId === null && (
              <div
                className={`p-3 rounded-lg border ${
                  isNewCustomer
                    ? "bg-amber-50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {isNewCustomer ? (
                  <p className="text-sm text-amber-800">
                    This will create a new customer:{" "}
                    <span className="font-semibold">
                      {formData.name.trim()}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-slate-700">
                    Adding transaction for:{" "}
                    <span className="font-semibold">
                      {existingCustomer?.name}
                    </span>
                    <span className="text-slate-500">
                      {" "}
                      ({existingCustomer?.transactionCount} previous transaction
                      {existingCustomer?.transactionCount !== 1 ? "s" : ""})
                    </span>
                  </p>
                )}
              </div>
            )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {editingId !== null ? "Update Transaction" : "Add Transaction"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Points Preview */}
      {formData.amount &&
        !isNaN(Number(formData.amount)) &&
        Number(formData.amount) > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm text-indigo-700">
              <span className="font-medium">Points Preview:</span> This
              transaction would earn{" "}
              <span className="font-bold">
                {calculatePoints(Number(formData.amount))} points
              </span>
            </p>
          </div>
        )}

      {/* Manually Added Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Manually Added Transactions ({manualTransactions.length})
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            These transactions are stored in memory and will be lost on page
            refresh.
          </p>
        </div>

        {manualTransactions.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400">
            No manual transactions yet. Use the form above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">
                  <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Amount
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Points
                  </th>
                  <th className="px-4 py-2.5 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      editingId === txn.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2.5 text-slate-500">#{txn.id}</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-700">
                        {txn.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        ID: {txn.customerId}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-700">
                      ${txn.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">
                      {calculatePoints(txn.amount)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(txn)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                          aria-label={`Edit transaction ${txn.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs"
                          aria-label={`Delete transaction ${txn.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

Admin.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      isManual: PropTypes.bool,
    }),
  ).isRequired,
  onAddTransaction: PropTypes.func.isRequired,
  onUpdateTransaction: PropTypes.func.isRequired,
  onDeleteTransaction: PropTypes.func.isRequired,
};

export default Admin;
