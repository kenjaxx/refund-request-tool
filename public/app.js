const form = document.getElementById('refund-form');
const formError = document.getElementById('form-error');
const statusFilter = document.getElementById('status-filter');
const ledgerBody = document.getElementById('ledger-body');
const emptyState = document.getElementById('empty-state');

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Refunded', 'Cancelled'];
let ticketMap = {};

async function refreshTicketMap() {
  const res = await fetch('/api/refunds');
  const all = await res.json();
  const sorted = [...all].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  ticketMap = {};
  sorted.forEach((r, i) => {
    ticketMap[r.id] = i + 1;
  });
}

function ticketLabel(id) {
  const n = ticketMap[id] || 0;
  return '#' + String(n).padStart(4, '0');
}

async function fetchRefunds() {
  await refreshTicketMap();

  const status = statusFilter.value;
  const url = status ? `/api/refunds?status=${encodeURIComponent(status)}` : '/api/refunds';
  const res = await fetch(url);
  const data = await res.json();
  renderLedger(data);
  updateCount();
}

async function updateCount() {
  const res = await fetch('/api/refunds');
  const all = await res.json();
  const pending = all.filter((r) => r.status === 'Pending').length;
  const countEl = document.getElementById('ledger-count');
  countEl.textContent = `${all.length} request${all.length === 1 ? '' : 's'} · ${pending} pending`;
}

function renderLedger(refunds) {
  ledgerBody.innerHTML = '';

  if (refunds.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  const sorted = [...refunds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  for (const refund of sorted) {
    const tr = document.createElement('tr');
    const filedDate = new Date(refund.createdAt).toLocaleDateString();

    tr.innerHTML = `
      <td class="ticket-id">${ticketLabel(refund.id)}</td>
      <td>${escapeHtml(refund.customerName)}<br><small>${escapeHtml(refund.customerEmail)}</small></td>
      <td class="amount">$${Number(refund.amount).toFixed(2)}</td>
      <td>${escapeHtml(refund.reason)}</td>
      <td>${filedDate}</td>
      <td><span class="stamp stamp-${refund.status}">${refund.status}</span></td>
      <td>
        <select data-id="${refund.id}" class="status-select">
          ${STATUSES.map(
            (s) => `<option value="${s}" ${s === refund.status ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
    `;

    ledgerBody.appendChild(tr);
  }

  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async (e) => {
      await updateStatus(e.target.getAttribute('data-id'), e.target.value);
      fetchRefunds();
    });
  });
}

async function updateStatus(id, status) {
  const res = await fetch(`/api/refunds/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    alert(`Failed to update status: ${err.error}`);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';

  const payload = {
    customerName: document.getElementById('customerName').value,
    customerEmail: document.getElementById('customerEmail').value,
    amount: document.getElementById('amount').value,
    reason: document.getElementById('reason').value,
  };

  const res = await fetch('/api/refunds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    formError.textContent = data.error;
    return;
  }

  form.reset();
  fetchRefunds();
});

statusFilter.addEventListener('change', fetchRefunds);

fetchRefunds();