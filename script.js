const WHEELHOUSE_API_URL = "http://localhost:3000/api/v1";

const collectionItems = [
  { id: 1, title: "Item 1", category: "category 1", description: "Description for Item 1." },
  { id: 2, title: "Item 2", category: "category 2", description: "Description for Item 2." },
  { id: 3, title: "Item 3", category: "category 1", description: "Description for Item 3." },
  { id: 4, title: "Item 4", category: "category 3", description: "Description for Item 4." },
  { id: 5, title: "Item 5", category: "category 2", description: "Description for Item 5." },
  { id: 6, title: "Item 6", category: "category 3", description: "Description for Item 6." },
];

const collectionList = document.querySelector("#collection-list");

function createItemNode(item) {
  const li = document.createElement("li");
  li.className = "collection-item";
  li.dataset.id = item.id;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const category = document.createElement("p");
  category.className = "item-category";
  category.textContent = item.category;

  const description = document.createElement("p");
  description.textContent = item.description;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "item-remove";
  removeBtn.textContent = "Remove";
  removeBtn.dataset.action = "remove";

  li.append(title, category, description, removeBtn);
  return li;
}

function renderCollection(items) {
  collectionList.replaceChildren(); 
  items.forEach((item) => {
    collectionList.appendChild(createItemNode(item));
  });
}

const searchInput = document.querySelector("#collection-search");
const categoryContainer = document.querySelector("#collection-categories");
const emptyMessage = document.querySelector("#collection-empty");

let activeCategory = "All";

function getCategories(items) {
  const unique = [...new Set(items.map((item) => item.category))];
  return ["All", ...unique];
}

function renderCategoryButtons(items) {
  categoryContainer.replaceChildren();
  getCategories(items).forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category;
    button.className = "category-btn";
    button.dataset.category = category;
    button.setAttribute("aria-pressed", category === activeCategory ? "true" : "false");
    categoryContainer.appendChild(button);
  });
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = collectionItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesQuery =
      query === "" ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  renderCollection(filtered);
  emptyMessage.hidden = filtered.length !== 0;
}

searchInput.addEventListener("input", applyFilters);

categoryContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".category-btn");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategoryButtons(collectionItems);
  applyFilters();
});

let nextItemId = collectionItems.length + 1;

collectionList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;

  const li = button.closest(".collection-item");
  const id = Number(li.dataset.id);
  const index = collectionItems.findIndex((item) => item.id === id);
  if (index !== -1) collectionItems.splice(index, 1);

  renderCategoryButtons(collectionItems);
  applyFilters();
});

renderCategoryButtons(collectionItems);
applyFilters();

const addItemForm = document.querySelector("#add-item-form");

addItemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const titleInput = document.querySelector("#new-title");
  const categoryInput = document.querySelector("#new-category");
  const descriptionInput = document.querySelector("#new-description");

  const title = titleInput.value.trim();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title || !category || !description) return; // minimal guard — real validation UX is step 6, for the contact form

  collectionItems.push({ id: nextItemId++, title, category, description });

  renderCategoryButtons(collectionItems);
  applyFilters();
  addItemForm.reset();
});

// Step 6: Contact form validation
const contactForm = document.querySelector("#contact-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");
const successMessage = document.querySelector("#contact-success");

const validators = {
  name: (value) => (value.trim() === "" ? "Please enter your name." : ""),
  email: (value) => {
    const trimmed = value.trim();
    if (trimmed === "") return "Please enter your email address.";
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(trimmed)) return "Enter a valid email address, like name@example.com.";
    return "";
  },
  message: (value) => (value.trim() === "" ? "Please enter a message." : ""),
};

function showError(input, message) {
  document.querySelector(`#${input.id}-error`).textContent = message;
}

function validateField(input) {
  const message = validators[input.name](input.value);
  showError(input, message);
  return message === "";
}

[nameInput, emailInput, messageInput].forEach((input) => {
  input.addEventListener("input", () => {
    const errorEl = document.querySelector(`#${input.id}-error`);
    if (errorEl.textContent !== "") validateField(input); // only re-checks once an error is already showing
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  successMessage.hidden = true;

  const fields = [nameInput, emailInput, messageInput];
  const allValid = fields.map(validateField).every(Boolean);

  if (allValid) {
    successMessage.hidden = false;
    contactForm.reset();
  }
});

// Step 7: Theme toggle
const themeToggle = document.querySelector("#theme-toggle");

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark-theme");
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.textContent = isDark ? "Dark mode: On" : "Dark mode: Off";
});

// Step 10 (Lab 10): Wheelhouse price list
const wheelhouseStatus = document.querySelector("#wheelhouse-status");
const wheelhouseTable = document.querySelector("#wheelhouse-table");
const wheelhouseTableBody = document.querySelector("#wheelhouse-table-body");
const wheelhouseLookupInput = document.querySelector("#wheelhouse-lookup-id");
const wheelhouseLookupButton = document.querySelector("#wheelhouse-lookup-button");
const wheelhouseLookupResult = document.querySelector("#wheelhouse-lookup-result");

function setWheelhouseStatus(message) {
  wheelhouseStatus.textContent = message;
}

function formatWheelhousePrice(price) {
  const amount = Number(price);
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : price;
}

function renderWheelhouseTable(services) {
  wheelhouseTableBody.replaceChildren();

  services.forEach((service) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = service.name;

    const priceCell = document.createElement("td");
    priceCell.textContent = formatWheelhousePrice(service.price);

    const countCell = document.createElement("td");
    countCell.textContent = String(service.repairs_charged_count);

    row.append(nameCell, priceCell, countCell);
    wheelhouseTableBody.appendChild(row);
  });

  wheelhouseTable.hidden = services.length === 0;
}

async function loadWheelhouseServices() {
  setWheelhouseStatus("Loading prices…");
  wheelhouseTable.hidden = true;

  let response;
  try {
    response = await fetch(`${WHEELHOUSE_API_URL}/services`);
  } catch (networkError) {
    setWheelhouseStatus("The price list couldn't be reached. Is the Wheelhouse server running?");
    return;
  }

  let payload;
  try {
    payload = await response.json();
  } catch (parseError) {
    setWheelhouseStatus("The price list couldn't be reached. Is the Wheelhouse server running?");
    return;
  }

  if (!response.ok) {
    const messages = Array.isArray(payload.errors) ? payload.errors.join(" ") : "Something went wrong.";
    setWheelhouseStatus(messages);
    return;
  }

  setWheelhouseStatus(`${payload.length} service${payload.length === 1 ? "" : "s"} loaded.`);
  renderWheelhouseTable(payload);
}

function renderWheelhouseLookupResult(service) {
  wheelhouseLookupResult.replaceChildren();

  const dl = document.createElement("dl");

  [
    ["Id", String(service.id)],
    ["Name", service.name],
    ["Price", formatWheelhousePrice(service.price)],
    ["Repairs charged", String(service.repairs_charged_count)],
  ].forEach(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    dl.append(dt, dd);
  });

  wheelhouseLookupResult.appendChild(dl);
}

async function lookupWheelhouseService() {
  const id = wheelhouseLookupInput.value.trim();
  wheelhouseLookupResult.replaceChildren();

  if (id === "") {
    wheelhouseLookupResult.textContent = "Enter a service id first.";
    return;
  }

  wheelhouseLookupResult.textContent = "Looking up…";

  let response;
  try {
    response = await fetch(`${WHEELHOUSE_API_URL}/services/${encodeURIComponent(id)}`);
  } catch (networkError) {
    wheelhouseLookupResult.textContent = "The price list couldn't be reached. Is the Wheelhouse server running?";
    return;
  }

  let payload;
  try {
    payload = await response.json();
  } catch (parseError) {
    wheelhouseLookupResult.textContent = "The price list couldn't be reached. Is the Wheelhouse server running?";
    return;
  }

  if (!response.ok) {
    const messages = Array.isArray(payload.errors) ? payload.errors.join(" ") : "Something went wrong.";
    wheelhouseLookupResult.textContent = messages;
    return;
  }

  renderWheelhouseLookupResult(payload);
}

wheelhouseLookupButton.addEventListener("click", lookupWheelhouseService);
wheelhouseLookupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    lookupWheelhouseService();
  }
});

loadWheelhouseServices();