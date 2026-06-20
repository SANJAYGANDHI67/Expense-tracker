// =========================
// SUPABASE CONFIG
// =========================

const supabaseUrl = "https://cytuhessunewtrcypwji.supabase.co/rest/v1/";
const supabaseKey = "sb_publishable_BfOL6m8SxsrU-2Fm7EN8UQ_kPCBqc6SY";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

// =========================
// HTML ELEMENTS
// =========================

const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");

// Store expenses from database
let expenses = [];

// =========================
// LOAD EXPENSES ON PAGE LOAD
// =========================

loadExpenses();

// =========================
// ADD EXPENSE
// =========================

addExpenseBtn.addEventListener("click", async () => {

    const name = expenseName.value.trim();
    const amount = expenseAmount.value;
    const category = expenseCategory.value;

    // Validation
    if (name === "") {
        alert("Please enter expense name");
        return;
    }

    if (amount === "" || Number(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    if (category === "") {
        alert("Please select a category");
        return;
    }

    // Insert into Supabase
    const { error } = await supabaseClient
        .from("Expense")
        .insert([
            {
                name: name,
                amount: Number(amount),
                category: category
            }
        ]);

    if (error) {
        console.error(error);
        alert("Failed to add expense");
        return;
    }

    clearInputs();

    loadExpenses();
});

// =========================
// LOAD EXPENSES
// =========================

async function loadExpenses() {

    const { data, error } = await supabaseClient
        .from("Expense")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    expenses = data || [];

    displayExpenses();
}

// =========================
// DISPLAY EXPENSES
// =========================

function displayExpenses() {

    expenseList.innerHTML = "";

    let total = 0;

    expenses.forEach((expense) => {

        total += Number(expense.amount);

        const expenseCard = document.createElement("div");

        expenseCard.classList.add("expense-item");

        expenseCard.innerHTML = `
            <div class="expense-info">
                <h3>${expense.name}</h3>
                <p>Category: ${expense.category}</p>
                <p>Amount: ₹${expense.amount}</p>
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

// =========================
// DELETE EXPENSE
// =========================

async function deleteExpense(id) {

    const { error } = await supabaseClient
        .from("Expense")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Failed to delete expense");
        return;
    }

    loadExpenses();
}

// =========================
// CLEAR INPUTS
// =========================

function clearInputs() {

    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
}