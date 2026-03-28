let currentTable = null;
let cart = [];
let total = 0;
let menuData = [];

const API_URL = "https://script.google.com/macros/s/AKfycbzokbDWTGUIqSDLnYvpkAs5YXdCCPbbl0AdvQZLojNHRvvekGc4NBe_esPNr4hgACDq/exec";

// 🔥 Load Menu from Google Sheet
window.onload = function () {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      menuData = data;
      loadMenuDropdown();
    });
};

function loadMenuDropdown() {
  const select = document.getElementById("item");

  menuData.forEach(item => {
    let option = document.createElement("option");
    option.value = item.name;
    option.text = `${item.name} (₹${item.price})`;
    select.appendChild(option);
  });
}

function getPrice(itemName) {
  const item = menuData.find(i => i.name === itemName);
  return item ? item.price : 0;
}
