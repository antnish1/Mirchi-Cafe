const API_URL = "https://script.google.com/macros/s/AKfycbyg8pQC29qyMFHyqFCbs0E3ldOTD7snYF5UGHlAsX6_72yemm61M9d39hy2mS771iws_w/exec" + "?t=" + new Date().getTime();
let menu = [];
let cart = [];
let total = 0;
let currentCategory = "";
let currentTable = null;

// LOAD MENU
window.onload = async () => {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });

    const text = await res.text();   // 👈 important
    menu = JSON.parse(text);         // 👈 manual parse

    loadCategories();

  } catch (err) {
    alert("Menu loading failed ❌ " + err);
    console.error(err);
  }
};

// CATEGORY BUTTONS
function loadCategories() {
  const cats = [...new Set(menu.map(m => m.category))];
  const div = document.getElementById("categories");

  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = cat;

    btn.onclick = () => {
      document.querySelectorAll(".categories button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      loadItems(cat);
    };

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

  if (cart.length === 0) {
    div.innerHTML = "<small>No items selected</small>";
    document.getElementById("total").innerText = 0;
    return;
  }

  div.innerHTML = cart.map(c => `
    <div class="cart-item">
      <span>${c.item} x${c.qty}</span>
      <span>₹${c.amount}</span>
    </div>
  `).join("");

  document.getElementById("total").innerText = total;
}}

// TABLE SELECT
function selectTable(t, el) {
  currentTable = t;

  document.querySelectorAll(".tables button")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
}

// GENERATE BILL
async function generateBill() {
  if (!currentTable) return showPopup("Select table", false);
  if (cart.length === 0) return showPopup("Cart empty", false);

  showLoader();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        table: currentTable,
        cart: cart,
        total: total
      })
    });

    const data = await res.json();

    hideLoader();

    if (data.status !== "success") {
      showPopup(data.message, false);
      return;
    }

    showPopup("Bill Generated: " + data.billId, true);

    cart = [];
    total = 0;
    renderCart();

  } catch (err) {
    hideLoader();
    showPopup("Error generating bill", false);
  }
}


function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showPopup(msg, success = true) {
  const popup = document.getElementById("popup");
  popup.innerText = msg;
  popup.style.display = "block";

  popup.style.borderTop = success ? "5px solid green" : "5px solid red";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}
