const API_URL = "https://script.google.com/macros/s/AKfycbyg8pQC29qyMFHyqFCbs0E3ldOTD7snYF5UGHlAsX6_72yemm61M9d39hy2mS771iws_w/exec";

let menu = [];
let cart = [];
let total = 0;
let currentCategory = "";
let currentTable = null;

// LOAD MENU
window.onload = async () => {
  const res = await fetch(API_URL);
  menu = await res.json();

  loadCategories();
};

// CATEGORY BUTTONS
function loadCategories() {
  const cats = [...new Set(menu.map(m => m.category))];

  const div = document.getElementById("categories");

  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = cat;
    btn.onclick = () => loadItems(cat);
    div.appendChild(btn);
  });

  loadItems(cats[0]);
}

// LOAD ITEMS
function loadItems(category) {
  currentCategory = category;

  const itemsDiv = document.getElementById("items");
  itemsDiv.innerHTML = "";

  menu.filter(m => m.category === category)
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
          <b>${item.name}</b><br>
          ₹${item.price}
        `;

        div.onclick = () => addItem(item);

        itemsDiv.appendChild(div);
      });
}

// ADD ITEM
function addItem(item) {
  cart.push({
    item: item.name,
    qty: 1,
    price: item.price,
    amount: item.price
  });

  total += item.price;
  renderCart();
}

// RENDER CART
function renderCart() {
  const div = document.getElementById("cartItems");

  div.innerHTML = cart.map(c =>
    `<div>${c.item} ₹${c.amount}</div>`
  ).join("");

  document.getElementById("total").innerText = total;
}

// TABLE SELECT
function selectTable(t, el) {
  currentTable = t;

  document.querySelectorAll(".tables button")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
}

// GENERATE BILL
async function generateBill() {
  if (!currentTable) return alert("Select table");
  if (cart.length === 0) return alert("Empty cart");

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      table: currentTable,
      cart: cart,
      total: total
    })
  });

  const data = await res.json();

  if (data.status !== "success") {
    alert(data.message);
    return;
  }

  alert("Bill: " + data.billId);

  cart = [];
  total = 0;
  renderCart();
}
