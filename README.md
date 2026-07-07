# Vehicle Purchase Calculator

A simple, dependency-free web app for estimating the true cost of buying a vehicle — including state tax, dealership fees, and loan interest — with a full cost breakdown and monthly payment estimate.

Built with plain **HTML, CSS, and JavaScript**. No frameworks, no build step.

## Features

- **Inputs**
  - Vehicle price
  - Down payment
  - Interest rate (% APR)
  - Loan term (24–84 months)
  - Dealership processing fee
  - State tax rate (%)
- **Results**
  - Estimated monthly payment
  - State tax and fee amounts
  - Total purchase cost
  - Amount financed
  - Total interest paid over the life of the loan
  - Grand total (down payment + all monthly payments)
- Input validation with friendly error messages
- Responsive layout — the form starts centered, then expands into a two-column view with results after calculating

## How It Works

1. State tax is applied to the vehicle price:
   `tax = price × taxRate`
2. The total purchase cost adds the processing fee:
   `totalCost = price + tax + fee`
3. The down payment is subtracted to get the amount financed:
   `financed = totalCost − downPayment`
4. The monthly payment uses the standard loan amortization formula:

   ```
   payment = financed × r / (1 − (1 + r)^−n)
   ```

   where `r` is the monthly interest rate (APR ÷ 12) and `n` is the loan term in months. Zero-interest loans and full-cash purchases are handled as special cases.

## Running Locally

No install needed — just open `index.html` in any modern browser.

Or serve it locally:

```sh
# Python
python -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment (GitHub Pages)

This repo includes a GitHub Actions workflow ([.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)) that deploys the site to GitHub Pages on every push to `main`.

One-time setup:

1. Push the repo to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.

The site will then be live at `https://<your-username>.github.io/<repo-name>/`.

## Project Structure

```
├── index.html   # Page markup and form
├── style.css    # Layout and styling
├── script.js    # Validation, calculation, and display logic
└── .github/workflows/deploy-pages.yml   # GitHub Pages deployment
```
