const form = document.getElementById("calc-form");
const resetBtn = document.getElementById("reset-btn");
const resultsSection = document.getElementById("results");
const errorMessage = document.getElementById("error-message");

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
  };
}

function validate(inputs) {
  const { vehiclePrice, downPayment, interestRate, processingFee, stateTaxRate } = inputs;

  if ([vehiclePrice, downPayment, interestRate, processingFee, stateTaxRate].some(Number.isNaN)) {
    return "Please fill in all fields with valid numbers.";
  }
  if (vehiclePrice <= 0) {
    return "Vehicle price must be greater than $0.";
  }
  if (downPayment < 0 || interestRate < 0 || processingFee < 0 || stateTaxRate < 0) {
    return "Values cannot be negative.";
  }

  const totalCost =
    vehiclePrice + processingFee + vehiclePrice * (stateTaxRate / 100);
  if (downPayment > totalCost) {
    return "Down payment cannot exceed the total purchase cost.";
  }
  return null;
}

function calculate(inputs) {
  const {
    vehiclePrice,
    downPayment,
    interestRate,
    loanTermMonths,
    processingFee,
    stateTaxRate,
  } = inputs;

  const taxAmount = vehiclePrice * (stateTaxRate / 100);
  const totalCost = vehiclePrice + taxAmount + processingFee;
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

function displayResults(inputs, results) {
  document.getElementById("monthly-payment").textContent = currency.format(results.monthlyPayment);
  document.getElementById("out-price").textContent = currency.format(inputs.vehiclePrice);
  document.getElementById("out-tax").textContent = currency.format(results.taxAmount);
  document.getElementById("out-fee").textContent = currency.format(inputs.processingFee);
  document.getElementById("out-total-cost").textContent = currency.format(results.totalCost);
  document.getElementById("out-down").textContent = "-" + currency.format(inputs.downPayment);
  document.getElementById("out-financed").textContent = currency.format(results.amountFinanced);
  document.getElementById("out-interest").textContent = currency.format(results.totalInterest);
  document.getElementById("out-grand-total").textContent = currency.format(results.grandTotal);
  resultsSection.hidden = false;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
  resultsSection.hidden = true;
}

function clearError() {
  errorMessage.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const inputs = getInputs();
  const error = validate(inputs);
  if (error) {
    showError(error);
    return;
  }

  clearError();
  displayResults(inputs, calculate(inputs));
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearError();
  resultsSection.hidden = true;
});
