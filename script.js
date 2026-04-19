const STORAGE_KEY = "moneyMovesPro.transactions";

const form = document.getElementById("transaction-form");
const idInput = document.getElementById("transaction-id");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const saveButton = document.getElementById("save-btn");
const cancelButton = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const formMessage = document.getElementById("form-message");
const listElement = document.getElementById("transaction-list");
const emptyState = document.getElementById("empty-state");
const totalIncomeElement = document.getElementById("total-income");
const totalExpensesElement = document.getElementById("total-expenses");
const remainingBalanceElement = document.getElementById("remaining-balance");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function showMessage(message) {
  formMessage.textContent = message;
}

function resetForm() {
  form.reset();
  idInput.value = "";
  typeInput.value = "income";
  formTitle.textContent = "Add Transaction";
  saveButton.textContent = "Save Transaction";
  cancelButton.classList.add("hidden");
}

function validateInput(description, amount) {
  if (!description.trim()) {
    return "Please enter a description.";
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Please enter an amount greater than 0.";
  }
  return "";
}

function updateSummary() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = income - expenses;

  totalIncomeElement.textContent = currency(income);
  totalExpensesElement.textContent = currency(expenses);
  remainingBalanceElement.textContent = currency(balance);
}

function renderTransactions() {
  listElement.textContent = "";
  emptyState.classList.toggle("hidden", transactions.length > 0);

  transactions.forEach((transaction) => {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const meta = document.createElement("div");
    meta.className = "meta";

    const description = document.createElement("strong");
    description.textContent = transaction.description;

    const detail = document.createElement("small");
    detail.textContent = transaction.type === "income" ? "Income" : "Expense";

    meta.append(description, detail);

    const amount = document.createElement("span");
    amount.className = `amount ${transaction.type}`;
    amount.textContent = `${transaction.type === "income" ? "+" : "-"}${currency(
      transaction.amount
    )}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "secondary";
    editButton.addEventListener("click", () => startEditing(transaction.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => removeTransaction(transaction.id));

    actions.append(editButton, deleteButton);
    li.append(meta, amount, actions);
    listElement.appendChild(li);
  });

  updateSummary();
}

function addTransaction({ description, amount, type }) {
  transactions = [
    {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount,
      type,
    },
    ...transactions,
  ];
}

function editTransaction(id, payload) {
  transactions = transactions.map((item) => {
    if (item.id !== id) return item;
    return { ...item, ...payload };
  });
}

function startEditing(id) {
  const transaction = transactions.find((item) => item.id === id);
  if (!transaction) return;

  idInput.value = transaction.id;
  descriptionInput.value = transaction.description;
  amountInput.value = String(transaction.amount);
  typeInput.value = transaction.type;
  formTitle.textContent = "Edit Transaction";
  saveButton.textContent = "Update Transaction";
  cancelButton.classList.remove("hidden");
  showMessage("Editing transaction.");
}

function removeTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
  saveTransactions();
  renderTransactions();
  showMessage("Transaction deleted.");

  if (idInput.value === id) {
    resetForm();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value;
  const amount = Number.parseFloat(amountInput.value);
  const type = typeInput.value === "expense" ? "expense" : "income";
  const error = validateInput(description, amount);

  if (error) {
    showMessage(error);
    return;
  }

  if (idInput.value) {
    editTransaction(idInput.value, { description: description.trim(), amount, type });
    showMessage("Transaction updated.");
  } else {
    addTransaction({ description, amount, type });
    showMessage("Transaction added.");
  }

  saveTransactions();
  renderTransactions();
  resetForm();
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit canceled.");
});

renderTransactions();
