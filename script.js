const result = document.getElementById("result");
const history = document.getElementById("history");

let expression = "";
let memory = 0;
let isDegree = true;
let calculationHistory = [];

function updateDisplay() {
    result.value = expression || "0";
}

function addValue(value) {
    expression += value;
    updateDisplay();
}

function clearCalculator() {
    expression = "";
    history.textContent = "Ready";
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    updateDisplay();
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        throw new Error("Invalid factorial");
    }

    let answer = 1;

    for (let i = 2; i <= n; i++) {
        answer *= i;
    }

    return answer;
}

function calculate() {
    try {
        let exp = expression;

        if (!exp) return;

        exp = exp.replace(/π/g, "Math.PI");
        exp = exp.replace(/\be\b/g, "Math.E");
        exp = exp.replace(/\^/g, "**");
        exp = exp.replace(/sqrt\(/g, "Math.sqrt(");
        exp = exp.replace(/log\(/g, "Math.log10(");
        exp = exp.replace(/ln\(/g, "Math.log(");

        exp = exp.replace(/sin\(/g, "Math.sin(");
        exp = exp.replace(/cos\(/g, "Math.cos(");
        exp = exp.replace(/tan\(/g, "Math.tan(");

        exp = exp.replace(/Math\.(sin|cos|tan)\(/g, (match) => {
            return isDegree
                ? match.replace("(", "((Math.PI/180)*")
                : match;
        });

        exp = exp.replace(/(\d+(?:\.\d+)?)!/g, "factorial($1)");

        exp = exp.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        if (!/^[0-9+\-*/().\sA-Za-z_]*$/.test(exp)) {
            throw new Error("Invalid Expression");
        }

        const answer = Function("factorial", '"use strict"; return (' + exp + ')')(factorial);

        if (!Number.isFinite(answer)) {
            throw new Error("Math Error");
        }

        calculationHistory.unshift(`${expression} = ${answer}`);
        history.textContent = expression + " =";

        expression = String(Number(answer.toPrecision(12)));

        updateDisplay();
        showHistory();

    } catch (error) {
        result.value = "Error";
        history.textContent = error.message;
        expression = "";
    }
}

function showHistory() {
    document.getElementById("historyList").innerHTML = "";

    calculationHistory.forEach(item => {
        const div = document.createElement("div");
        div.textContent = item;
        document.getElementById("historyList").appendChild(div);
    });
}

document.querySelectorAll("[data-value]").forEach(button => {
    button.addEventListener("click", () => {
        addValue(button.dataset.value);
    });
});

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "clear") clearCalculator();
        if (action === "delete") deleteLast();
        if (action === "calculate") calculate();

        if (action === "memory-clear") memory = 0;
        if (action === "memory-recall") addValue(String(memory));
        if (action === "memory-add") memory += Number(result.value);
        if (action === "memory-subtract") memory -= Number(result.value);
    });
});

document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("light");
});

document.getElementById("angleBtn").addEventListener("click", function() {
    isDegree = !isDegree;
    this.textContent = isDegree ? "DEG" : "RAD";
});

document.getElementById("historyBtn").addEventListener("click", () => {
    document.getElementById("historyPanel").classList.toggle("show");
});

document.getElementById("clearHistory").addEventListener("click", () => {
    calculationHistory = [];
    showHistory();
});

document.addEventListener("keydown", event => {
    if (/^[0-9.+\-*/()]$/.test(event.key)) {
        addValue(event.key);
    }

    if (event.key === "Enter") calculate();
    if (event.key === "Backspace") deleteLast();
    if (event.key === "Escape") clearCalculator();
});

updateDisplay();