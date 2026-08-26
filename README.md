# Refund Ledger

An internal tool for a support team to create, view, filter, and update customer refund requests.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** Plain HTML/CSS/JavaScript (no framework, no build step)
- **Storage:** JSON file (`server/data/refunds.json`)

## Requirements

- Node.js 18+ installed

## How to Run

```bash
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

The server runs on port 3000 by default. To use a different port:

```bash
PORT=4000 npm start
```

## Features

- Create a refund request (customer name, email, amount, reason)
- View all refund requests in a ledger table
- Filter requests by status (Pending, Approved, Rejected, Refunded, Cancelled)
- Update a request's status
- Live count of total requests and pending requests

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/refunds` | List all refund requests |
| GET | `/api/refunds?status=Pending` | List requests filtered by status |
| POST | `/api/refunds` | Create a new refund request |
| PATCH | `/api/refunds/:id` | Update a request's status |

## Project Structure