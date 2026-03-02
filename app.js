// Simple Expense Tracker - localStorage based
const STORAGE_KEY = 'expenses_v1';
let expenses = [];
let editingId = null;

// DOM
const form = document.getElementById('expense-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expense-list');
const totalEl = document.getElementById('total');
const monthlyEl = document.getElementById('monthly');
const filterMonth = document.getElementById('filter-month');
const clearFilterBtn = document.getElementById('clear-filter');
const resetBtn = document.getElementById('reset-btn');
const ctx = document.getElementById('category-chart').getContext('2d');
let chart = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    expenses = raw ? JSON.parse(raw) : [];
  } catch (e) {
    expenses = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function formatMoney(n){
  return '$' + Number(n||0).toFixed(2);
}

function renderList(filterMonthValue){
  expenseList.innerHTML = '';
  const list = expenses.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  let total = 0;
  let monthlyTotal = 0;
  const now = new Date();
  const filterYM = filterMonthValue || null;

  list.forEach(item=>{
    if(filterYM){
      const ym = item.date.slice(0,7);
      if(ym !== filterYM) return;
    }
    total += Number(item.amount);
    const itemDate = new Date(item.date);
    if(itemDate.getFullYear()===now.getFullYear() && itemDate.getMonth()===now.getMonth()) monthlyTotal += Number(item.amount);

    const li = document.createElement('li');
    li.className = 'expense-item';
    li.dataset.id = item.id;
    li.innerHTML = `
      <div class="expense-meta">
        <div>
          <div style="font-weight:600">${escapeHtml(item.title)}</div>
          <div class="small-muted">${new Date(item.date).toLocaleDateString()} • <span class="badge">${escapeHtml(item.category)}</span></div>
        </div>
      </div>
      <div class="actions">
        <div class="expense-amount">${formatMoney(item.amount)}</div>
        <button class="edit-btn" title="Edit">✎</button>
        <button class="delete-btn" title="Delete">🗑</button>
      </div>
    `;
    expenseList.appendChild(li);
  });
  totalEl.textContent = formatMoney(total);
  monthlyEl.textContent = formatMoney(monthlyTotal);
  attachListHandlers();
  renderChart(filterYM);
}

function attachListHandlers(){
  expenseList.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.onclick = (e)=>{
      const id = e.target.closest('.expense-item').dataset.id;
      deleteExpense(id);
    };
  });
  expenseList.querySelectorAll('.edit-btn').forEach(btn=>{
    btn.onclick = (e)=>{
      const id = e.target.closest('.expense-item').dataset.id;
      startEdit(id);
    };
  });
}

function startEdit(id){
  const item = expenses.find(x=>x.id===id);
  if(!item) return;
  editingId = id;
  titleInput.value = item.title;
  amountInput.value = item.amount;
  categoryInput.value = item.category;
  dateInput.value = item.date;
  window.scrollTo({top:0,behavior:'smooth'});
}

function deleteExpense(id){
  if(!confirm('Delete this expense?')) return;
  expenses = expenses.filter(x=>x.id!==id);
  save();
  renderList(filterMonth.value || null);
}

function addOrUpdateExpense(e){
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;
  if(!title || !amount || !date) return alert('Please fill in required fields');
  if(editingId){
    const idx = expenses.findIndex(x=>x.id===editingId);
    if(idx>-1){
      expenses[idx] = { ...expenses[idx], title, amount, category, date };
    }
    editingId = null;
  } else {
    const newItem = { id: uid(), title, amount, category, date };
    expenses.push(newItem);
  }
  form.reset();
  save();
  renderList(filterMonth.value || null);
}

function resetAll(){
  if(!confirm('Reset all expenses? This cannot be undone.')) return;
  expenses = [];
  save();
  renderList(null);
}

function renderChart(filterMonthValue){
  // aggregate by category
  const map = {};
  const list = expenses;
  list.forEach(it=>{
    if(filterMonthValue){
      const ym = it.date.slice(0,7);
      if(ym !== filterMonthValue) return;
    }
    map[it.category] = (map[it.category] || 0) + Number(it.amount);
  });
  const labels = Object.keys(map);
  const data = labels.map(l=>map[l]);
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets:[{data, backgroundColor: ['#2563eb','#7c3aed','#06b6d4','#f97316','#ef4444','#10b981'] }]
    },
    options:{maintainAspectRatio:true,plugins:{legend:{position:'bottom'}}}
  });
}

function escapeHtml(s){
  return (s+'').replace(/[&<>"'`]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'})[c]);
}

// init date default to today
n(function init(){
  load();
  const today = new Date();
  dateInput.value = today.toISOString().slice(0,10);
  renderList(null);
  form.addEventListener('submit', addOrUpdateExpense);
  filterMonth.addEventListener('change', ()=> renderList(filterMonth.value || null));
  clearFilterBtn.addEventListener('click', ()=>{ filterMonth.value=''; renderList(null); });
  resetBtn.addEventListener('click', resetAll);
})();