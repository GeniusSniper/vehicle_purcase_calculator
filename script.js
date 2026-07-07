const form = document.getElementById("calc-form");
const layout = document.querySelector(".layout");
const resetBtn = document.getElementById("reset-btn");
const findDownBtn = document.getElementById("find-down-btn");
const resultsSection = document.getElementById("results");
const errorMessage = document.getElementById("error-message");

const STORAGE_KEY = "vehicle-calc-inputs";
const FIELD_IDS = [
  "vehicle-price",
  "down-payment",
  "interest-rate",
  "loan-term",
  "processing-fee",
  "state-tax",
  "other-fees",
  "wanted-payment",
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function getInputs() {
  return {
    vehiclePrice: parseFloat(document.getElementById("vehicle-price").value),
    downPayment: parseFloat(document.getElementById("down-payment").value),
    interestRate: parseFloat(document.getElementById("interest-rate").value),
    loanTermMonths: parseInt(document.getElementById("loan-term").value, 10),
    processingFee: parseFloat(document.getElementById("processing-fee").value),
    stateTaxRate: parseFloat(document.getElementById("state-tax").value),
    otherFees: parseFloat(document.getElementById("other-fees").value),
  };
}

function totalCostOf(inputs) {
  return (
    inputs.vehiclePrice +
    inputs.vehiclePrice * (inputs.stateTaxRate / 100) +
    inputs.processingFee +
    inputs.otherFees
  );
}

function validate(inputs) {
  const { vehiclePrice, downPayment, interestRate, processingFee, stateTaxRate, otherFees } = inputs;

  if ([vehiclePrice, downPayment, interestRate, processingFee, stateTaxRate, otherFees].some(Number.isNaN)) {
    return "Please fill in all fields with valid numbers.";
  }
  if (vehiclePrice <= 0) {
    return "Vehicle price must be greater than $0.";
  }
  if (downPayment < 0 || interestRate < 0 || processingFee < 0 || stateTaxRate < 0 || otherFees < 0) {
    return "Values cannot be negative.";
  }
  if (downPayment > totalCostOf(inputs)) {
    return "Down payment cannot exceed the total purchase cost.";
  }
  return null;
}

function calculate(inputs) {
  const { vehiclePrice, downPayment, interestRate, loanTermMonths, stateTaxRate } = inputs;

  const taxAmount = vehiclePrice * (stateTaxRate / 100);
  const totalCost = totalCostOf(inputs);
  const amountFinanced = totalCost - downPayment;

  const monthlyRate = interestRate / 100 / 12;
  let monthlyPayment;
  if (amountFinanced === 0) {
    monthlyPayment = 0;
  } else if (monthlyRate === 0) {
    monthlyPayment = amountFinanced / loanTermMonths;
  } else {
    // Standard amortization formula: P * r / (1 - (1 + r)^-n)
    monthlyPayment =
      (amountFinanced * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -loanTermMonths));
  }

  const totalOfPayments = monthlyPayment * loanTermMonths;
  const totalInterest = totalOfPayments - amountFinanced;
  const grandTotal = downPayment + totalOfPayments;

  return {
    taxAmount,
    totalCost,
    amountFinanced,
    monthlyPayment,
    totalInterest,
    grandTotal,
  };
}

// Inverse of the amortization formula: given a target monthly payment,
// how much can be financed, and therefore how much must be put down.
function downPaymentForPayment(inputs, wantedPayment) {
  const { interestRate, loanTermMonths } = inputs;
  const monthlyRate = interestRate / 100 / 12;

  const maxFinanced =
    monthlyRate === 0
      ? wantedPayment * loanTermMonths
      : (wantedPayment * (1 - Math.pow(1 + monthlyRate, -loanTermMonths))) / monthlyRate;

  const down = totalCostOf(inputs) - maxFinanced;
  return Math.max(0, down);
}

function displayResults(inputs, results) {
  document.getElementById("monthly-payment").textContent = currency.format(results.monthlyPayment);
  document.getElementById("out-price").textContent = currency.format(inputs.vehiclePrice);
  document.getElementById("out-tax").textContent = currency.format(results.taxAmount);
  document.getElementById("out-fee").textContent = currency.format(inputs.processingFee);
  document.getElementById("out-other").textContent = currency.format(inputs.otherFees);
  document.getElementById("out-total-cost").textContent = currency.format(results.totalCost);
  document.getElementById("out-down").textContent = "-" + currency.format(inputs.downPayment);
  document.getElementById("out-financed").textContent = currency.format(results.amountFinanced);
  document.getElementById("out-interest").textContent = currency.format(results.totalInterest);
  document.getElementById("out-grand-total").textContent = currency.format(results.grandTotal);
  resultsSection.hidden = false;
  layout.classList.add("has-results");
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  resultsSection.hidden = true;
  layout.classList.remove("has-results");
}

function clearError() {
  errorMessage.hidden = true;
}

function saveInputs() {
  const values = {};
  for (const id of FIELD_IDS) {
    values[id] = document.getElementById(id).value;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Storage unavailable (private mode, etc.) — persistence is best-effort.
  }
}

function restoreInputs() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
  if (!saved) return false;

  for (const id of FIELD_IDS) {
    if (id in saved) {
      document.getElementById(id).value = saved[id];
    }
  }
  return true;
}

function runCalculation() {
  const inputs = getInputs();
  const error = validate(inputs);
  if (error) {
    showError(error);
    return;
  }
  clearError();
  displayResults(inputs, calculate(inputs));
  saveInputs();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runCalculation();
});

findDownBtn.addEventListener("click", () => {
  const wantedPayment = parseFloat(document.getElementById("wanted-payment").value);
  if (Number.isNaN(wantedPayment) || wantedPayment <= 0) {
    showError("Enter a wanted monthly payment greater than $0.");
    return;
  }

  const inputs = getInputs();
  inputs.downPayment = 0;
  const error = validate(inputs);
  if (error) {
    showError(error);
    return;
  }

  const down = downPaymentForPayment(inputs, wantedPayment);
  document.getElementById("down-payment").value = down.toFixed(2);
  runCalculation();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearError();
  resultsSection.hidden = true;
  layout.classList.remove("has-results");
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
});

// Select the whole value when an input gains focus, so typing replaces it.
form.addEventListener("focusin", (event) => {
  if (event.target.matches("input")) {
    event.target.select();
  }
});

// Remember edits as they happen, not only on Calculate.
form.addEventListener("input", saveInputs);
form.addEventListener("change", saveInputs);

// On load, restore the last session and show its result right away.
if (restoreInputs()) {
  const inputs = getInputs();
  if (!validate(inputs)) {
    clearError();
    displayResults(inputs, calculate(inputs));
  }
}
