let currentTable = null;
let cart = [];
let total = 0;
let menuData = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzokbDWTGUIqSDLnYvpkAs5YXdCCPbbl0AdvQZLojNHRvvekGc4NBe_esPNr4hgACDq/exec";

// 🔥 LOAD MENU
window.onload = async function () {
  try {
    const res = await fetch(API_URL);
    menuData = await res.json();
    loadMenuDropdown();
  } catch (err) {
    alert("Menu loading failed ❌");
    console.error(err);
  }
};

// 🔽 LOAD MENU
function loadMenuDropdown() {
  const select = document.getElementById("item");
  select.innerHTML = `<option value="">Select Item</option>`;

  menuData.forEach(item => {
    let option = document.createElement("option");
    option.value = item.name;
    option.text = `${item.name} (₹${item.price})`;
    select.appendChild(option);
  });
}

// 🔍 GET PRICE
function getPrice(itemName) {
  const item = menuData.find(i => i.name === itemName);
  return item ? Number(item.price) : 0;
}

// 🪑 SELECT TABLE
function selectTable(tableNo) {
  currentTable = tableNo;
  document.getElementById("tableTitle").innerText = "Table " + tableNo;

  cart = [];
  total = 0;
  renderCart();
}

// ➕ ADD ITEM (FIXED)
function addItem() {
  const item = document.getElementById("item").value;
  const qty = Number(document.getElementById("qty").value);

  // 🔥 VALIDATION
  if (!currentTable) {
    alert("Select table first");
    return;
  }

  if (!item) {
    alert("Select item");
    return;
  }

  if (!qty || qty <= 0) {
    alert("Enter valid quantity");
    return;
  }

  const price = getPrice(item);
  const amount = price * qty;

  cart.push({ item, qty, price, amount });
  total += amount;

  document.getElementById("qty").value = "";

  renderCart();
}

// 🧾 RENDER CART
function renderCart() {
  const cartDiv = document.getElementById("cart");

  if (cart.length === 0) {
    cartDiv.innerHTML = "<p>No items</p>";
    document.getElementById("total").innerText = "0";
    return;
  }

  let html = "";

  cart.forEach((c, index) => {
    html += `
      <div class="cart-item">
        <span>${c.item} x ${c.qty}</span>
        <span>₹${c.amount}</span>
      </div>
    `;
  });

  cartDiv.innerHTML = html;
  document.getElementById("total").innerText = total;
}

// 🧾 GENERATE BILL
async function generateBill() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

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

    alert("Bill Generated ✅ " + data.billId);

    cart = [];
    total = 0;
    renderCart();

  } catch (err) {
    alert("Billing failed ❌");
    console.error(err);
  }
}
