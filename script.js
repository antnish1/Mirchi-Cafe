let currentTable = null;
let cart = [];
let total = 0;

function selectTable(tableNo) {
  currentTable = tableNo;
  document.getElementById("tableTitle").innerText = "Table " + tableNo;
}

function addItem() {
  const item = document.getElementById("item").value;
  const qty = document.getElementById("qty").value;

  const price = getPrice(item); // from menu
  const amount = price * qty;

  cart.push({ item, qty, price, amount });
  total += amount;

  renderCart();
}

function renderCart() {
  let html = "";
  cart.forEach(c => {
    html += `<p>${c.item} x ${c.qty} = ₹${c.amount}</p>`;
  });

  document.getElementById("cart").innerHTML = html;
  document.getElementById("total").innerText = total;
}

function generateBill() {
  fetch("YOUR_APPS_SCRIPT_URL", {
    method: "POST",
    body: JSON.stringify({
      table: currentTable,
      cart: cart,
      total: total
    })
  })
  .then(res => res.text())
  .then(() => {
    alert("Bill Generated!");
    cart = [];
    total = 0;
    renderCart();
  });
}
