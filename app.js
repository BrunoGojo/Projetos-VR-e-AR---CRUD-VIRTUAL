const STORAGE_KEY = "vrCrudItems";

// Elementos do formulário
const nameInput = document.getElementById("itemName");
const categoryInput = document.getElementById("itemCategory");
const colorInput = document.getElementById("itemColor");
const sizeInput = document.getElementById("itemSize");
const idInput = document.getElementById("itemId");

// Outros elementos da interface
const statusBox = document.getElementById("statusBox");
const itemsList = document.getElementById("itemsList");
const itemsContainer = document.getElementById("itemsContainer");

// Estado da aplicação
let selectedItemId = null;

/* =========================
   Funções auxiliares
========================= */

function setStatus(message) {
  statusBox.textContent = message;
}

function generateId() {
  return "item-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/* =========================
   LocalStorage
========================= */

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* =========================
   Mock de dados
========================= */

function createMockItem() {
  const names = [
    "Cubo Solar",
    "Artefato Lunar",
    "Cristal Azul",
    "Orbe Verde",
    "Relíquia VR",
    "Totem Digital"
  ];

  const categories = [
    "Museu",
    "Produto",
    "Educacional",
    "Experimento",
    "Coleção"
  ];

  const colors = [
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#eab308",
    "#a855f7",
    "#f97316"
  ];

  return {
    id: generateId(),
    name: randomFrom(names),
    category: randomFrom(categories),
    color: randomFrom(colors),
    size: Number((Math.random() * 1.2 + 0.8).toFixed(1))
  };
}

/* =========================
   Simulação dos verbos HTTP
========================= */

function apiGetItems() {
  return loadItems();
}

function apiPostItem(newItem) {
  const items = loadItems();
  items.push(newItem);
  saveItems(items);
  return newItem;
}

function apiPutItem(id, updatedData) {
  const items = loadItems();
  const index = items.findIndex(item => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = { ...items[index], ...updatedData };
  saveItems(items);
  return items[index];
}

function apiDeleteItem(id) {
  const items = loadItems();
  const filtered = items.filter(item => item.id !== id);
  saveItems(filtered);
  return true;
}

/* =========================
   Formulário
========================= */

function clearForm() {
  selectedItemId = null;
  idInput.value = "";
  nameInput.value = "";
  categoryInput.value = "";
  colorInput.value = "#ef4444";
  sizeInput.value = "1";
}

function fillForm(item) {
  selectedItemId = item.id;
  idInput.value = item.id;
  nameInput.value = item.name;
  categoryInput.value = item.category;
  colorInput.value = item.color;
  sizeInput.value = item.size;
}

function validateForm() {
  if (!nameInput.value.trim()) {
    setStatus("Informe o nome do item.");
    return false;
  }

  if (!categoryInput.value.trim()) {
    setStatus("Informe a categoria do item.");
    return false;
  }

  return true;
}

/* =========================
   Seleção visual
========================= */

function updateSelectionVisual() {
  const entities = itemsContainer.querySelectorAll("[data-id]");

  entities.forEach(entity => {
    const id = entity.getAttribute("data-id");
    const box = entity.querySelector("a-box");

    if (!box) return;

    if (id === selectedItemId) {
      box.setAttribute(
        "material",
        "emissive: #ffffff; emissiveIntensity: 0.25"
      );
      box.setAttribute("scale", "1.08 1.08 1.08");
    } else {
      box.setAttribute(
        "material",
        "emissive: #000000; emissiveIntensity: 0"
      );
      box.setAttribute("scale", "1 1 1");
    }
  });
}

function selectItem(id) {
  const items = apiGetItems();
  const item = items.find(i => i.id === id);

  if (!item) return;

  fillForm(item);
  updateSelectionVisual();
  setStatus(`Item selecionado: ${item.name} (${item.id})`);
}

/* =========================
   Lista HTML
========================= */

function renderList(items) {
  itemsList.innerHTML = "";

  if (!items.length) {
    itemsList.innerHTML = '<div class="card">Nenhum item cadastrado ainda.</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <strong>${item.name}</strong>
      Categoria: ${item.category}<br>
      Tamanho: ${item.size}<br>
      ID: ${item.id}<br>
      <span class="tag">Cor: ${item.color}</span>
    `;

    card.addEventListener("click", () => selectItem(item.id));
    itemsList.appendChild(card);
  });
}

/* =========================
   Cena 3D
========================= */

function createItemEntity(item, index) {
  const entity = document.createElement("a-entity");

  const cols = 4;
  const spacingX = 3.1;
  const spacingZ = 3.2;

  const col = index % cols;
  const row = Math.floor(index / cols);

  const x = (col - 1.5) * spacingX;
  const z = -5 - row * spacingZ;
  const y = item.size / 2;

  entity.setAttribute("position", `${x} 0 ${z}`);
  entity.setAttribute("data-id", item.id);
  entity.classList.add("clickable");

  const box = document.createElement("a-box");
  box.setAttribute("position", `0 ${y} 0`);
  box.setAttribute("depth", item.size);
  box.setAttribute("height", item.size);
  box.setAttribute("width", item.size);
  box.setAttribute("color", item.color);
  box.setAttribute("shadow", "cast: true; receive: true");
  box.setAttribute(
    "animation__enter",
    "property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear"
  );

  if (item.id === selectedItemId) {
    box.setAttribute("material", "emissive: #ffffff; emissiveIntensity: 0.25");
    box.setAttribute("scale", "1.08 1.08 1.08");
  }

  const label = document.createElement("a-text");
  label.setAttribute("value", `${item.name}\n${item.category}`);
  label.setAttribute("position", `0 ${item.size + 0.8} 0`);
  label.setAttribute("align", "center");
  label.setAttribute("color", "#ffffff");
  label.setAttribute("width", "4");

  const idText = document.createElement("a-text");
  idText.setAttribute("value", item.id.replace("item-", "#"));
  idText.setAttribute("position", `0 0.2 ${item.size * 0.6 + 0.4}`);
  idText.setAttribute("align", "center");
  idText.setAttribute("color", "#cbd5e1");
  idText.setAttribute("width", "4");

  entity.appendChild(box);
  entity.appendChild(label);
  entity.appendChild(idText);

  entity.addEventListener("click", () => selectItem(item.id));

  entity.addEventListener("mouseenter", () => {
    if (item.id !== selectedItemId) {
      box.setAttribute("scale", "1.05 1.05 1.05");
    }
  });

  entity.addEventListener("mouseleave", () => {
    if (item.id !== selectedItemId) {
      box.setAttribute("scale", "1 1 1");
    }
  });

  return entity;
}

function renderScene() {
  const items = apiGetItems();
  itemsContainer.innerHTML = "";

  items.forEach((item, index) => {
    itemsContainer.appendChild(createItemEntity(item, index));
  });

  renderList(items);
  updateSelectionVisual();
}

/* =========================
   Botões CRUD
========================= */

document.getElementById("createBtn").addEventListener("click", () => {
  if (!validateForm()) return;

  const newItem = {
    id: generateId(),
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    color: colorInput.value,
    size: Number(sizeInput.value || 1)
  };

  apiPostItem(newItem);
  fillForm(newItem);
  renderScene();
  setStatus(`POST executado: item "${newItem.name}" criado com sucesso.`);
});

document.getElementById("updateBtn").addEventListener("click", () => {
  if (!selectedItemId) {
    setStatus("Selecione um item para atualizar.");
    return;
  }

  if (!validateForm()) return;

  const updated = apiPutItem(selectedItemId, {
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    color: colorInput.value,
    size: Number(sizeInput.value || 1)
  });

  if (!updated) {
    setStatus("Não foi possível atualizar o item.");
    return;
  }

  fillForm(updated);
  renderScene();
  setStatus(`PUT executado: item "${updated.name}" atualizado.`);
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  if (!selectedItemId) {
    setStatus("Selecione um item para remover.");
    return;
  }

  const currentId = selectedItemId;
  apiDeleteItem(currentId);
  clearForm();
  renderScene();
  setStatus(`DELETE executado: item ${currentId} removido.`);
});

document.getElementById("mockBtn").addEventListener("click", () => {
  const items = [];

  for (let i = 0; i < 6; i++) {
    items.push(createMockItem());
  }

  saveItems(items);
  clearForm();
  renderScene();
  setStatus("Mocks criados com sucesso.");
});

document.getElementById("clearBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  clearForm();
  renderScene();
  setStatus("Todos os dados foram removidos do localStorage.");
});

/* =========================
   Inicialização
========================= */

function initApp() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialItems = [createMockItem(), createMockItem(), createMockItem()];
    saveItems(initialItems);
  }

  renderScene();
  setStatus("Aplicação carregada com sucesso.");
}

initApp();