// =========================
// SUPABASE CONFIG
// =========================

const supabaseUrl = "https://cytuhessunewtrcypwji.supabase.co";
const supabaseKey = "sb_publishable_BfOL6m8SxsrU-2Fm7EN8UQ_kPCBqc6S"; 
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
const expenseDate =
    document.getElementById("expenseDate");
const filterCategory =
    document.getElementById("filterCategory");
    const searchExpense =
    document.getElementById("searchExpense");

    const reportMonth =
    document.getElementById("reportMonth");

    const sortExpense =
    document.getElementById("sortExpense");
    const selectedValue =
    reportMonth.value;

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const remainingBudget = document.getElementById("remainingBudget");


// Store expenses from database
let expenses = [];
// chart
let expenseChart;

// Budget
let budget = Number(localStorage.getItem("budget")) || 0;

// =========================
// LOAD DATA ON PAGE LOAD
// =========================

// =========================
// LOAD DATA ON PAGE LOAD
// =========================

loadExpenses();
updateBudgetInfo();

// =========================
// FILTER CATEGORY
// =========================

filterCategory.addEventListener(
    "change",
    displayExpenses
);

// =========================
// SEARCH EXPENSE
// =========================

searchExpense.addEventListener(
    "input",
    displayExpenses
);

//sort Expense//
sortExpense.addEventListener(
    "change",
    displayExpenses
);
// =========================
// SAVE BUDGET
// =========================

saveBudgetBtn.addEventListener("click", () => {

    budget = Number(budgetInput.value);

    if (budget <= 0) {
        alert("Please enter a valid budget");
        return;
    }

    localStorage.setItem("budget", budget);

    updateBudgetInfo();

    alert("Budget Saved Successfully");
});


// =========================
// ADD EXPENSE
// =========================
addExpenseBtn.addEventListener("click", async () => {

    const name = expenseName.value.trim();
    const amount = expenseAmount.value;
    const category = expenseCategory.value;
    const date = expenseDate.value;

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

    if (date === "") {
        alert("Please select date");
        return;
    }

    const { error } = await supabaseClient
        .from("Expense")
        .insert([
            {
                name: name,
                amount: Number(amount),
                category: category,
                date: date
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

    let total = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount),
        0
    );

    const selectedCategory =
        filterCategory.value;

    const searchText =
        searchExpense.value.toLowerCase();

    const filteredExpenses =
        expenses.filter(expense => {

            const categoryMatch =
                selectedCategory === "All" ||
                expense.category === selectedCategory;

            const searchMatch =
                expense.name
                    .toLowerCase()
                    .includes(searchText);

            return categoryMatch && searchMatch;
        });

    // SORT EXPENSES

    const sortValue =
        sortExpense.value;

    if (sortValue === "high") {

        filteredExpenses.sort(
            (a, b) =>
                Number(b.amount) -
                Number(a.amount)
        );

    } else if (sortValue === "low") {

        filteredExpenses.sort(
            (a, b) =>
                Number(a.amount) -
                Number(b.amount)
        );

    } else if (sortValue === "latest") {

        filteredExpenses.sort(
            (a, b) =>
                b.id - a.id
        );

    } else if (sortValue === "oldest") {

        filteredExpenses.sort(
            (a, b) =>
                a.id - b.id
        );
    }

    filteredExpenses.forEach((expense) => {

        const expenseCard =
            document.createElement("div");

        expenseCard.classList.add(
            "expense-item"
        );

        expenseCard.innerHTML = `
            <div class="expense-info">
                <h3>${expense.name}</h3>
                <p>Category: ${expense.category}</p>
                <p>Amount: ₹${expense.amount}</p>
                <p>Date: ${expense.date}</p>
            </div>

            <button
                class="delete-btn"
                onclick="deleteExpense(${expense.id})"
            >
                Delete
            </button>
        `;

        expenseList.appendChild(
            expenseCard
        );
    });

    totalAmount.textContent =
        `₹${total}`;

    updateBudgetInfo();
    updateChart();
}

// =========================
// UPDATE BUDGET INFO
// =========================

function updateBudgetInfo() {

    let total = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount),
        0
    );

    let remaining = budget - total;

    remainingBudget.textContent =
        `Remaining Budget: ₹${remaining}`;

    // Progress Bar

    const progressBar =
        document.getElementById("progressBar");

    const budgetPercent =
        document.getElementById("budgetPercent");

    let percent = 0;

    if (budget > 0) {
        percent = (total / budget) * 100;
    }

    progressBar.style.width =
        `${Math.min(percent, 100)}%`;

    budgetPercent.textContent =
        `${percent.toFixed(1)}% Used`;

    // Budget Alert

    if (budget > 0 && total > budget) {

        alert(
            "⚠ Budget Exceeded!"
        );
    }
}

// =========================
// UPDATE CHART
// =========================

function updateChart() {

    const categories = {};

    expenses.forEach(expense => {

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] +=
            Number(expense.amount);
    });

    const labels =
        Object.keys(categories);

    const values =
        Object.values(categories);

    const ctx =
        document.getElementById("expenseChart");

    if (!ctx) return;

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [
                {
                    data: values
                }
            ]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
//MONTHLY REPORT//
monthlyReportBtn.addEventListener("click", () => {

    const selectedValue =
        reportMonth.value;

    const categories = {};

    let total = 0;

    expenses.forEach(expense => {

        const expenseDate =
            new Date(expense.date);

        let includeExpense = false;

        // Last 7 Days
        if (selectedValue === "last7days") {

            const today = new Date();

            const sevenDaysAgo =
                new Date();

            sevenDaysAgo.setDate(
                today.getDate() - 7
            );

            includeExpense =
                expenseDate >= sevenDaysAgo;

        }
        // Selected Month
        else {

            includeExpense =
                expenseDate.getMonth() ===
                Number(selectedValue);
        }

        if (!includeExpense) {
            return;
        }

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] +=
            Number(expense.amount);

        total +=
            Number(expense.amount);
    });

    let report =
        "📊 Expense Report\n\n";

    for (let category in categories) {

        report +=
            `${category}: ₹${categories[category]}\n`;
    }

    report +=
        `\nTotal: ₹${total}`;

    alert(report);
});

     
// DOWNLOAD CSV//
const downloadCsvBtn =
    document.getElementById("downloadCsvBtn");

downloadCsvBtn.addEventListener(
    "click",
    () => {

        let csv =
            "Name,Amount,Category,Date\n";

        expenses.forEach(expense => {

            csv +=
                `${expense.name},${expense.amount},${expense.category},${expense.date}\n`;
        });

        const blob =
            new Blob(
                [csv],
                { type: "text/csv" }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;
        a.download =
            "expense-report.csv";

        a.click();

        URL.revokeObjectURL(url);
    }
);
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
    expenseDate.value = "";
}