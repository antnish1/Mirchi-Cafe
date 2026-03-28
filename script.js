const API_URL = "https://script.google.com/macros/s/AKfycbyg8pQC29qyMFHyqFCbs0E3ldOTD7snYF5UGHlAsX6_72yemm61M9d39hy2mS771iws_w/exec" + "?t=" + new Date().getTime();
let menu = [];
let cart = [];
let total = 0;
let currentCategory = "";
let currentTable = null;
const categoryIcons = {
  "BURGER": "🍔",
  "CHINESE": "🥡",
  "COFFEE": "☕",
  "KATHI ROLL": "🌯",
  "MOCKTAILS": "🍹",
  "MOMOS": "🥟",
  "PASTA": "🍝",
  "PIZZA": "🍕",
  "SANDWICH": "🥪",
  "SHAKE": "🥤",
  "STARTER": "🍟",
  "TEA": "🍵",
  "MAGGI": "🍜",
  "FRIED RICE": "🍚"
};
// LOAD MENU
window.onload = async () => {
  showLoader();

  // 🔥 FORCE UI to render loader first
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });

    const text = await res.text();
    
    try {
      menu = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", text);
      showPopup("Menu load error", false);
      return;
    }
    
    if (!Array.isArray(menu) || menu.length === 0) {
      showPopup("Menu is empty", false);
      return;
    }

    loadCategories();
    loadTodaySales();

  } catch (err) {
    showPopup("Menu loading failed", false);
    console.error(err);
  }

  hideLoader();
};
  


// CATEGORY BUTTONS
function loadCategories() {
  const div = document.getElementById("categories");
  div.innerHTML = "";   // 🔥 ADD THIS

  const cats = [...new Set(menu.map(m => m.category))];

  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = `${categoryIcons[cat] || "🍽️"} ${cat}`;

    btn.onclick = () => {
      document.querySelectorAll(".categories button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      loadItems(cat);
    };

    div.appendChild(btn);
  });

  if (cats.length > 0) loadItems(cats[0]);
}

// LOAD ITEMS
function loadItems(category) {
  const itemsDiv = document.getElementById("items");
  itemsDiv.innerHTML = "";

  menu.filter(m => m.category === category)
    .forEach(item => {
      const div = document.createElement("div");
      div.className = "item";

    div.innerHTML = `
      <div class="item-icon">
        ${categoryIcons[item.category] || "🍽️"}
      </div>
      <div class="item-name">${item.name}</div>
      <div class="item-price">₹${item.price}</div>
    `;

      div.onclick = () => addItem(item);

      itemsDiv.appendChild(div);
    });
}

// ADD ITEM
function addItem(item) {
  const existing = cart.find(c => c.item === item.name);

  if (existing) {
    existing.qty += 1;
    existing.amount = existing.qty * existing.price;
  } else {
    cart.push({
      item: item.name,
      qty: 1,
      price: item.price,
      amount: item.price
    });
  }

  total = cart.reduce((sum, i) => sum + i.amount, 0);
  renderCart();
}


// RENDER CART
function renderCart() {
  const div = document.getElementById("cartItems");

  if (cart.length === 0) {
    div.innerHTML = "<small>No items added</small>";
    document.getElementById("total").innerText = 0;
    return;
  }

  div.innerHTML = cart.map((c, index) => `
    <div class="cart-item">
      <span>${c.item} x${c.qty}</span>

      <div style="display:flex; align-items:center;">
        <span class="item-price">₹${c.amount}</span>
        <button onclick="removeItem(${index})" class="remove-btn">×</button>
      </div>
    </div>
  `).join("");

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
  if (!currentTable) {
    showPopup("Select table", false);
    return;
  }

  if (cart.length === 0) {
    showPopup("Cart empty", false);
    return;
  }

  showLoader();

  // 🔥 force render
  await new Promise(resolve => setTimeout(resolve, 100));

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

    const billId = data.billId;

    // 🔥 SHOW PREVIEW BEFORE CLEARING
    showBillPreview(billId);
    
    cart = [];
    total = 0;
    renderCart();

    await loadTodaySales();

    hideLoader();
    showPopup("Bill Generated", true);

  } catch (err) {
    hideLoader();
    showPopup("Error generating bill", false);
  }
}


function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  } else {
    console.error("Loader not found");
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

function showPopup(message, success = true) {
  const popup = document.getElementById("popup");

  if (!popup) {
    alert(message); // fallback
    return;
  }

  popup.innerText = message;
  popup.style.display = "block";

  popup.style.borderTop = success
    ? "4px solid #22C55E"
    : "4px solid #EF4444";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

async function loadTodaySales() {
  try {
    const res = await fetch(API_URL + "&type=today");
    const data = await res.json();

    const el = document.getElementById("todaySale");

    el.style.opacity = 0.5;

    setTimeout(() => {
      el.innerText = data.total || 0;
      el.style.opacity = 1;
    }, 200);

  } catch (err) {
    console.log("Sales fetch failed");
  }
}

function removeItem(index) {
  cart.splice(index, 1);
  total = cart.reduce((sum, i) => sum + i.amount, 0);
  renderCart();
}



function sendWhatsAppBill(billId) {
  let message = `🧾 *FCV Café Bill*\n\n`;
  message += `Bill ID: ${billId}\n\n`;

  cart.forEach(c => {
    message += `${c.item} x${c.qty} = ₹${c.amount}\n`;
  });

  message += `\nTotal: ₹${total}`;

  const phone = prompt("Enter WhatsApp Number (with country code)");

  if (!phone) return;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}



function showBillPreview(billId) {
  const div = document.getElementById("billContent");

  let html = `
    <h3 style="text-align:center;">Mirchi Cafe</h3>
    <p>Bill ID: ${billId}</p>
    <hr>
  `;

  cart.forEach(c => {
    html += `
      <div style="display:flex; justify-content:space-between;">
        <span>${c.item} x${c.qty}</span>
        <span>₹${c.amount}</span>
      </div>
    `;
  });

  html += `
    <hr>
    <h3>Total: ₹${total}</h3>
  `;

  div.innerHTML = html;

  document.getElementById("billModal").style.display = "flex";
}

function closeBill() {
  document.getElementById("billModal").style.display = "none";
}
