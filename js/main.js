// ---- CART HELPERS ----

function saveCart(cart) {
  localStorage.setItem("mzansi_cart", JSON.stringify(cart));
}

function loadCart() {
  var saved = localStorage.getItem("mzansi_cart");
  return saved ? JSON.parse(saved) : [];
}

function saveWishlist(list) {
  localStorage.setItem("mzansi_wishlist", JSON.stringify(list));
}

function loadWishlist() {
  var saved = localStorage.getItem("mzansi_wishlist");
  return saved ? JSON.parse(saved) : [];
}

// Updates the cart number shown in the nav
function updateCartCount() {
  var cart = loadCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total = total + cart[i].qty;
  }
  var el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}

// Add a product to the cart
function addToCart(productId) {
  var cart = loadCart();
  var product = null;

  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === productId) {
      product = PRODUCTS[i];
    }
  }
  if (!product) return;

  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId) {
      cart[i].qty = cart[i].qty + 1;
      found = true;
    }
  }

  if (!found) {
    cart.push({ id: product.id, name: product.name, farm: product.farm, loc: product.loc, price: product.price, img: product.img, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
  showToast(product.name + " added to cart");
}

// Save or remove a product from the wishlist
function toggleWishlist(productId, event) {
  if (event) event.stopPropagation();

  var wishlist = loadWishlist();
  var product = null;
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === productId) product = PRODUCTS[i];
  }
  if (!product) return;

  var alreadySaved = false;
  var newList = [];
  for (var i = 0; i < wishlist.length; i++) {
    if (wishlist[i].id === productId) {
      alreadySaved = true;
    } else {
      newList.push(wishlist[i]);
    }
  }

  if (alreadySaved) {
    saveWishlist(newList);
    showToast(product.name + " removed from saved items");
  } else {
    newList.push(product);
    saveWishlist(newList);
    showToast(product.name + " saved");
  }

  if (typeof renderPageProducts === "function") {
    renderPageProducts();
  }
}

// Build one product card as an HTML string
function buildProductCard(product) {
  var wishlist = loadWishlist();
  var isSaved = false;
  for (var i = 0; i < wishlist.length; i++) {
    if (wishlist[i].id === product.id) isSaved = true;
  }

  var badge = product.orig ? '<span class="prod-badge">SALE</span>' : "";
  var origPrice = product.orig ? '<span class="prod-orig">R' + product.orig + '</span>' : "";
  var heart = isSaved ? "♥" : "♡";
  var heartClass = isSaved ? "prod-wish saved" : "prod-wish";

  var imgHTML = '<span>No image</span>';
  if (product.img) {
    imgHTML = '<img src="' + product.img + '" alt="' + product.name + '" onerror="this.style.display=\'none\'">';
  }

  // Check if the product is in season this month
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var thisMonth = months[new Date().getMonth()];
  var inSeason = false;
  if (product.season) {
    for (var s = 0; s < product.season.length; s++) {
      if (product.season[s] === thisMonth) inSeason = true;
    }
  }
  var seasonTag = inSeason
    ? '<span class="season-badge in-season">In season</span>'
    : '<span class="season-badge out-season">Out of season</span>';

  var card = '<div class="prod-card" onclick="handleCardClick(event, ' + product.id + ')">'
    + '<div class="prod-img">'
    + badge
    + '<div class="' + heartClass + '" onclick="toggleWishlist(' + product.id + ', event)">' + heart + '</div>'
    + imgHTML
    + '</div>'
    + '<div class="prod-body">'
    + seasonTag
    + '<div class="prod-cat">' + product.cat + '</div>'
    + '<div class="prod-name">' + product.name + '</div>'
    + '<div class="prod-farm">' + product.farm + ' · ' + product.loc + '</div>'
    + '<div class="prod-footer">'
    + '<div><span class="prod-price">R' + product.price + '/' + product.unit + '</span>' + origPrice + '</div>'
    + '<button class="btn-add" onclick="addToCart(' + product.id + '); event.stopPropagation()">+ Add</button>'
    + '</div>'
    + '</div>'
    + '</div>';

  return card;
}

// Go to the product detail page when a card is clicked
function handleCardClick(event, productId) {
  if (event.target.classList.contains("btn-add")) return;
  if (event.target.classList.contains("prod-wish")) return;
  localStorage.setItem("mzansi_current_product", productId);
  window.location.href = "product.html";
}

// Handle search from the nav bar
function handleNavSearch(event) {
  if (event.key === "Enter") {
    var value = event.target.value.trim();
    if (value !== "") {
      localStorage.setItem("mzansi_search", value);
      window.location.href = "browse.html";
    }
  }
}

// Small popup message at the bottom of the screen
function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function() {
    toast.classList.remove("show");
  }, 2800);
}