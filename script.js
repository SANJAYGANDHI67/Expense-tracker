// Get HTML Elements

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");

// Load expenses from localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Display expenses when page loads
displayExpenses();

/*
    Add Expense
*/
addExpenseBtn.addEventListener("click", () => {

    const name = expenseName.value.trim();
    const amount = expenseAmount.value;
    const category = expenseCategory.value;

    // Validation
    if (name === "") {
        alert("Please enter expense name");
        return;
    }

    if (amount === "" || amount <= 0) {
        alert("Please enter valid amount");
        return;
    }

    if (category === "") {
        alert("Please select a category");
        return;
    }

    // Expense Object
    const expense = {
        id: Date.now(),
        name,
        amount: Number(amount),
        category
    };

    expenses.push(expense);

    saveExpenses();

    clearInputs();

    displayExpenses();
});

/*
    Save to Local Storage
*/
function saveExpenses() {
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

/*
    Display Expenses
*/
function displayExpenses() {

    expenseList.innerHTML = "";

    let total = 0;

    expenses.forEach((expense) => {

        total += expense.amount;

        const expenseCard = document.createElement("div");

        expenseCard.classList.add("expense-item");

        expenseCard.innerHTML = `
            <div class="expense-info">
                <h3>${expense.name}</h3>
                <p>
                    Category: ${expense.category}
                </p>
                <p>
                    Amount: ₹${expense.amount}
                </p>
            </div>

            <button
                class="delete-btn"
                onclick="deleteExpense(${expense.id})"
            >
                Delete
            </button>
        `;

        expenseList.appendChild(expenseCard);
    });

    totalAmount.textContent = `₹${total}`;
}

/*
    Delete Expense
*/
function deleteExpense(id) {

    expenses = expenses.filter(
        expense => expense.id !== id
    );

    saveExpenses();

    displayExpenses();
}

/*
    Clear Inputs
*/
function clearInputs() {
    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
}