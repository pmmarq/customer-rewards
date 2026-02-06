import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";

function CustomerCombobox({ customers, value, onChange, error }) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const justSelectedRef = useRef(false);

  // Sync internal input value with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter customers based on input (customers is already pre-computed uniqueCustomers)
  const filteredCustomers = useMemo(() => {
    if (!inputValue.trim()) return customers;
    const search = inputValue.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(search));
  }, [customers, inputValue]);

  // Check if current input matches an existing customer exactly
  const existingCustomer = useMemo(() => {
    if (!inputValue.trim()) return null;
    return customers.find(
      (c) => c.name.toLowerCase() === inputValue.trim().toLowerCase(),
    );
  }, [customers, inputValue]);

  const isNewCustomer = inputValue.trim() && !existingCustomer;

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  // Handle selecting a customer from dropdown
  const handleSelectCustomer = (customerName) => {
    justSelectedRef.current = true;
    setInputValue(customerName);
    onChange(customerName);
    setIsOpen(false);
  };

  // Handle creating new customer
  const handleCreateNew = () => {
    justSelectedRef.current = true;
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    const itemCount = filteredCustomers.length + (isNewCustomer ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % itemCount);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case "Enter":
        e.preventDefault();
        if (isNewCustomer && highlightedIndex === 0) {
          handleCreateNew();
        } else {
          const customerIndex = isNewCustomer
            ? highlightedIndex - 1
            : highlightedIndex;
          if (filteredCustomers[customerIndex]) {
            handleSelectCustomer(filteredCustomers[customerIndex].name);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlighted = listRef.current.querySelector(
        '[data-highlighted="true"]',
      );
      if (highlighted && typeof highlighted.scrollIntoView === "function") {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative">
      <label
        htmlFor="customer-combobox"
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        Customer Name
      </label>
      <input
        ref={inputRef}
        type="text"
        id="customer-combobox"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="customer-combobox-listbox"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
          }
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        placeholder="Search or enter new customer name"
      />

      {/* Helper text - Feature #1 */}
      {inputValue.trim() && (
        <p
          className={`mt-1 text-sm ${
            isNewCustomer ? "text-amber-600" : "text-green-600"
          }`}
        >
          {isNewCustomer
            ? "New customer will be created"
            : `Adding transaction for existing customer (${existingCustomer?.transactionCount} previous transactions)`}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown list */}
      {isOpen && (
        <ul
          ref={listRef}
          id="customer-combobox-listbox"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {/* Create new customer option - Feature #3 */}
          {isNewCustomer && (
            <li
              role="option"
              aria-selected={highlightedIndex === 0}
              data-highlighted={highlightedIndex === 0}
              onClick={handleCreateNew}
              className={`px-3 py-2 cursor-pointer border-b border-slate-100 ${
                highlightedIndex === 0 ? "bg-amber-50" : "hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  +
                </span>
                <span className="text-amber-700 font-medium">
                  Create "{inputValue.trim()}" as new customer
                </span>
              </div>
            </li>
          )}

          {/* Existing customers */}
          {filteredCustomers.map((customer, index) => {
            const itemIndex = isNewCustomer ? index + 1 : index;
            const isHighlighted = highlightedIndex === itemIndex;

            return (
              <li
                key={customer.customerId}
                role="option"
                aria-selected={isHighlighted}
                data-highlighted={isHighlighted}
                onClick={() => handleSelectCustomer(customer.name)}
                className={`px-3 py-2 cursor-pointer ${
                  isHighlighted ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    {customer.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {customer.transactionCount} transaction
                    {customer.transactionCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </li>
            );
          })}

          {/* Empty state */}
          {filteredCustomers.length === 0 && !isNewCustomer && (
            <li className="px-3 py-2 text-slate-400 text-sm">
              No customers found. Start typing to create a new one.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

CustomerCombobox.propTypes = {
  customers: PropTypes.arrayOf(
    PropTypes.shape({
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      transactionCount: PropTypes.number.isRequired,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default React.memo(CustomerCombobox);
