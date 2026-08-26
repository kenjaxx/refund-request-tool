# Notes

## Assumptions

- Refund requests move through five possible statuses: Pending (default on
  creation), Approved, Rejected, Refunded, and Cancelled. The brief didn't
  specify exact status values, so I chose a set that reflects a realistic
  support workflow, and added Cancelled since a request can become
  inactive without ever being refunded or explicitly rejected.
- This is a single shared internal tool with no login or user roles, since
  the brief didn't mention multiple users or access control. Anyone with
  the URL can create requests and update statuses.
- Refund amount is a single currency, entered as a positive decimal number.

## Improvements Added

- Server-side validation on create (name, valid email format, positive
  amount, reason all required) and on status updates (must be one of the
  five valid statuses), with clear error messages returned to the user.
- Proper HTTP status codes: 201 on create, 400 on validation errors, 404
  when updating a request that doesn't exist.
- If the data file ever becomes corrupted or unreadable, the app logs the
  issue and resets to an empty list instead of crashing.
- Basic HTML-escaping on the frontend so customer-entered text (like the
  reason field) can't break the page or inject scripts.
- A live count of total and pending requests above the ledger.

## Known Limitations

- Data is stored in a single JSON file with no locking, so it isn't safe
  for multiple people writing to it at the exact same time. Fine for a
  small internal tool, not production-grade at scale.
- No authentication — anyone with access can view or change any request.
- No pagination — the ledger loads everything at once.
- No automated tests. I tested all endpoints and UI flows manually,
  including validation and error cases, but didn't have an automated
  suite in place.
- No audit history — updating a status overwrites the previous one rather
  than keeping a log of who changed what and when.

## What I'd Improve With More Time

- Replace the JSON file with a real database (SQLite or Postgres) behind
  the same data-access module, so the API routes wouldn't need to change.
- Add authentication and a status-change history/audit log.
- Add pagination and search by customer name or email.
- Add an automated test suite for the API endpoints.
- Add a loading state on the submit button and toast-style notifications
  instead of a plain alert() for failed status updates.