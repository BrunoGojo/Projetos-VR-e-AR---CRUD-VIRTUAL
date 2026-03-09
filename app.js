const STORAGE_KEY = "vrCrudItemsOnly";

const PREDEFINED_ITEMS = [
  { name: "Cubo Solar", category: "Museu" },
  { name: "Artefato Lunar", category: "Produto" },
  { name: "Cristal Azul", category: "Educacional" },
  { name: "Orbe Verde", category: "Experimento" },
  { name: "Relíquia VR", category: "Coleção" },
  { name: "Totem Digital", category: "Laboratório" }
];

const COLOR_OPTIONS = [
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#f97316"
];

const itemsContainer = document.getElementById("itemsContainer");
const vrItemsListContainer = document.getElementById("vrItemsListContainer");
const vrStatus = document.getElementById("vrStatus");
const vrSelectedName = document.getElementById("vrSelectedName");
const vrSelectedCategory = document.getElementById("vrSelectedCategory");
const vrSelectedSize = document.getElementById("vrSelectedSize");
const vrColorPreview = document.getElementById("vrColorPreview");
const selectedItemInfo = document.getElementById("selectedItemInfo");

const nameButtonsContainer = document.getElementById("nameButtonsContainer");
const colorButtonsContainer = document.getElementById("colorButtonsContainer");

const createBtn3D = document.getElementById("createBtn3D");
const updateBtn3D = document.getElementById("updateBtn3D");
const deleteBtn3D = document.getElementById("deleteBtn3D");
const sizeDownBtn = document.getElementById("sizeDownBtn");
const sizeUpBtn = document.getElementById("sizeUpBtn");

let selectedItemId = null;

let formState = {
  name: PREDEFINED_ITEMS[0].name,
  category: PREDEFINED_ITEMS[0].category,
  color: COLOR_OPTIONS[0],
  size: 1.0
};

function setStatus(message) {
  vrStatus.setAttribute("value", message);
}

function generateId() {
  return "item-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

  if (index === -1) return null;

  items[index] = { ...items[index], ...updatedData };
  saveItems(items);
  return items[index];
}

function apiDeleteItem(id) {
  const items = loadItems().filter(item => item.id !== id);
  saveItems(items);
  return true;
}

function createMockItem() {
  const base = randomFrom(PREDEFINED_ITEMS);
  return {
    id: generateId(),
    name: base.name,
    category: base.category,
    color: randomFrom(COLOR_OPTIONS),
    size: Number((Math.random() * 1.2 + 0.8).toFixed(1))
  };
}

function updateFormPanel() {
  vrSelectedName.setAttribute("value", formState.name);
  vrSelectedCategory.setAttribute("value", formState.category);
  vrSelectedSize.setAttribute("value", formState.size.toFixed(1));
  vrColorPreview.setAttribute("color", formState.color);

  document.querySelectorAll(".name-btn").forEach(btn => {
    const btnName = btn.getAttribute("data-name");
    const isActive = btnName === formState.name;
    btn.setAttribute("color", isActive ? "#2563eb" : "#334155");
    btn.setAttribute("scale", isActive ? "1.05 1.05 1.05" : "1 1 1");
  });

  document.querySelectorAll(".color-btn").forEach(btn => {
    const color = btn.getAttribute("data-color");
    const isActive = color === formState.color;

    btn.setAttribute("scale", isActive ? "1.2 1.2 1.2" : "1 1 1");
    btn.setAttribute(
      "material",
      isActive
        ? `color: ${color}; emissive: #ffffff; emissiveIntensity: 0.25`
        : `color: ${color}; emissive: #000000; emissiveIntensity: 0`
    );
  });
}

function clearSelection() {
  selectedItemId = null;
  selectedItemInfo.setAttribute("value", "Nenhum item selecionado");
  updateSelectionVisual();
}

function fillFormFromItem(item) {
  selectedItemId = item.id;
  formState = {
    name: item.name,
    category: item.category,
    color: item.color,
    size: Number(item.size)
  };

  selectedItemInfo.setAttribute(
    "value",
    `Selecionado:\n${item.name} | ${item.category}\nID: ${item.id}`
  );

  updateFormPanel();
  updateSelectionVisual();
}

function updateSelectionVisual() {
  const entities = itemsContainer.querySelectorAll("[data-id]");

  entities.forEach(entity => {
    const id = entity.getAttribute("data-id");
    const box = entity.querySelector("a-box");

    if (!box) return;

    if (id === selectedItemId) {
      box.setAttribute("material", "emissive: #ffffff; emissiveIntensity: 0.28");
      box.setAttribute("scale", "1.1 1.1 1.1");
    } else {
      box.setAttribute("material", "emissive: #000000; emissiveIntensity: 0");
      box.setAttribute("scale", "1 1 1");
    }
  });

  const listCards = vrItemsListContainer.querySelectorAll("[data-list-id]");
  listCards.forEach(card => {
    const id = card.getAttribute("data-list-id");
    card.setAttribute("color", id === selectedItemId ? "#1d4ed8" : "#1e293b");
    card.setAttribute("scale", id === selectedItemId ? "1.02 1.02 1.02" : "1 1 1");
  });
}

function selectItem(id) {
  const item = apiGetItems().find(i => i.id === id);
  if (!item) return;

  fillFormFromItem(item);
  setStatus(`Item selecionado: ${item.name}`);
}

function createAnimatedButtonListeners(buttonEl, onClick) {
  buttonEl.addEventListener("mouseenter", () => {
    buttonEl.setAttribute("animation__hover", "property: scale; to: 1.06 1.06 1.06; dur: 120");
  });

  buttonEl.addEventListener("mouseleave", () => {
    buttonEl.setAttribute("animation__leave", "property: scale; to: 1 1 1; dur: 120");
  });

  buttonEl.addEventListener("click", () => {
    buttonEl.setAttribute("animation__press", "property: scale; to: 0.94 0.94 0.94; dur: 80; dir: alternate; loop: 1");
    onClick();
  });
}

function createNameButtons() {
  nameButtonsContainer.innerHTML = "";

  PREDEFINED_ITEMS.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;

    const x = col === 0 ? -0.72 : 0.72;
    const y = -0.88 - (row * 0.24);

    const btn = document.createElement("a-plane");
    btn.setAttribute("width", "1.15");
    btn.setAttribute("height", "0.16");
    btn.setAttribute("position", `${x} ${y} 0.01`);
    btn.setAttribute("color", "#334155");
    btn.setAttribute("class", "clickable name-btn");
    btn.setAttribute("data-name", item.name);
    btn.setAttribute("data-category", item.category);

    const label = document.createElement("a-text");
    label.setAttribute("value", item.name);
    label.setAttribute("position", `${x} ${y - 0.04} 0.02`);
    label.setAttribute("align", "center");
    label.setAttribute("color", "#ffffff");
    label.setAttribute("width", "2.05");
    label.setAttribute("wrap-count", "14");

    btn.addEventListener("click", () => {
      formState.name = item.name;
      formState.category = item.category;
      updateFormPanel();
      setStatus(`Nome selecionado: ${item.name}`);
    });

    btn.addEventListener("mouseenter", () => {
      if (formState.name !== item.name) btn.setAttribute("scale", "1.04 1.04 1.04");
    });

    btn.addEventListener("mouseleave", () => {
      if (formState.name !== item.name) btn.setAttribute("scale", "1 1 1");
    });

    nameButtonsContainer.appendChild(btn);
    nameButtonsContainer.appendChild(label);
  });
}

function createColorButtons() {
  colorButtonsContainer.innerHTML = "";

  COLOR_OPTIONS.forEach((color, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);

    const x = -0.96 + (col * 0.34);
    const y = -1.72 - (row * 0.28);

    const btn = document.createElement("a-sphere");
    btn.setAttribute("radius", "0.09");
    btn.setAttribute("position", `${x} ${y} 0.03`);
    btn.setAttribute("color", color);
    btn.setAttribute("class", "clickable color-btn");
    btn.setAttribute("data-color", color);

    btn.addEventListener("click", () => {
      formState.color = color;
      updateFormPanel();
      setStatus("Cor alterada.");
    });

    btn.addEventListener("mouseenter", () => {
      if (formState.color !== color) btn.setAttribute("scale", "1.12 1.12 1.12");
    });

    btn.addEventListener("mouseleave", () => {
      if (formState.color !== color) btn.setAttribute("scale", "1 1 1");
    });

    colorButtonsContainer.appendChild(btn);
  });
}

function createListCard(item, index) {
  const rowHeight = 0.44;
  const y = 0.62 - (index * rowHeight);

  const bg = document.createElement("a-plane");
  bg.setAttribute("width", "2.45");
  bg.setAttribute("height", "0.32");
  bg.setAttribute("position", `0 ${y} 0.01`);
  bg.setAttribute("color", item.id === selectedItemId ? "#1d4ed8" : "#1e293b");
  bg.setAttribute("class", "clickable");
  bg.setAttribute("data-list-id", item.id);

  const txt = document.createElement("a-text");
  txt.setAttribute("value", `${item.name}\n${item.category} | tam ${item.size}`);
  txt.setAttribute("position", `-1.08 ${y + 0.06} 0.02`);
  txt.setAttribute("align", "left");
  txt.setAttribute("color", "#ffffff");
  txt.setAttribute("width", "2.1");
  txt.setAttribute("wrap-count", "24");

  const colorDot = document.createElement("a-sphere");
  colorDot.setAttribute("radius", "0.06");
  colorDot.setAttribute("position", `0.98 ${y} 0.03`);
  colorDot.setAttribute("color", item.color);

  bg.addEventListener("click", () => selectItem(item.id));
  bg.addEventListener("mouseenter", () => {
    if (item.id !== selectedItemId) bg.setAttribute("scale", "1.02 1.02 1.02");
  });
  bg.addEventListener("mouseleave", () => {
    if (item.id !== selectedItemId) bg.setAttribute("scale", "1 1 1");
  });

  vrItemsListContainer.appendChild(bg);
  vrItemsListContainer.appendChild(txt);
  vrItemsListContainer.appendChild(colorDot);
}

function renderVRList(items) {
  vrItemsListContainer.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("a-text");
    empty.setAttribute("value", "Nenhum item cadastrado.");
    empty.setAttribute("position", "0 0.2 0.01");
    empty.setAttribute("align", "center");
    empty.setAttribute("color", "#cbd5e1");
    empty.setAttribute("width", "2.4");
    vrItemsListContainer.appendChild(empty);
    return;
  }

  items.slice(0, 5).forEach((item, index) => {
    createListCard(item, index);
  });
}

function createItemEntity(item, index) {
  const entity = document.createElement("a-entity");

  const cols = 3;
  const spacingX = 2.45;
  const spacingZ = 2.75;

  const col = index % cols;
  const row = Math.floor(index / cols);

  const x = (col - 1) * spacingX;
  const z = -5.9 - row * spacingZ;
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
    "animation__spin",
    "property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear"
  );

  const label = document.createElement("a-text");
  label.setAttribute("value", `${item.name}\n${item.category}`);
  label.setAttribute("position", `0 ${item.size + 0.65} 0`);
  label.setAttribute("align", "center");
  label.setAttribute("color", "#ffffff");
  label.setAttribute("width", "3.2");
  label.setAttribute("wrap-count", "14");

  const idText = document.createElement("a-text");
  idText.setAttribute("value", item.id.replace("item-", "#"));
  idText.setAttribute("position", `0 0.18 ${item.size * 0.6 + 0.35}`);
  idText.setAttribute("align", "center");
  idText.setAttribute("color", "#cbd5e1");
  idText.setAttribute("width", "3.2");

  entity.appendChild(box);
  entity.appendChild(label);
  entity.appendChild(idText);

  entity.addEventListener("click", () => selectItem(item.id));

  entity.addEventListener("mouseenter", () => {
    if (item.id !== selectedItemId) box.setAttribute("scale", "1.06 1.06 1.06");
  });

  entity.addEventListener("mouseleave", () => {
    if (item.id !== selectedItemId) box.setAttribute("scale", "1 1 1");
  });

  return entity;
}

function renderScene() {
  const items = apiGetItems();
  itemsContainer.innerHTML = "";

  items.forEach((item, index) => {
    itemsContainer.appendChild(createItemEntity(item, index));
  });

  renderVRList(items);
  updateSelectionVisual();
}

function handleCreate() {
  const newItem = {
    id: generateId(),
    name: formState.name,
    category: formState.category,
    color: formState.color,
    size: Number(formState.size.toFixed(1))
  };

  apiPostItem(newItem);
  fillFormFromItem(newItem);
  renderScene();
  setStatus(`Item criado: ${newItem.name}`);
}

function handleUpdate() {
  if (!selectedItemId) {
    setStatus("Selecione um item para atualizar.");
    return;
  }

  const updated = apiPutItem(selectedItemId, {
    name: formState.name,
    category: formState.category,
    color: formState.color,
    size: Number(formState.size.toFixed(1))
  });

  if (!updated) {
    setStatus("Não foi possível atualizar.");
    return;
  }

  fillFormFromItem(updated);
  renderScene();
  setStatus(`Item atualizado: ${updated.name}`);
}

function handleDelete() {
  if (!selectedItemId) {
    setStatus("Selecione um item para remover.");
    return;
  }

  const deletedId = selectedItemId;
  apiDeleteItem(selectedItemId);
  clearSelection();
  renderScene();
  setStatus(`Item removido: ${deletedId}`);
}

function bindEvents() {
  createAnimatedButtonListeners(createBtn3D, handleCreate);
  createAnimatedButtonListeners(updateBtn3D, handleUpdate);
  createAnimatedButtonListeners(deleteBtn3D, handleDelete);

  createAnimatedButtonListeners(sizeDownBtn, () => {
    formState.size = clamp(Number((formState.size - 0.1).toFixed(1)), 0.6, 2.5);
    updateFormPanel();
    setStatus("Tamanho reduzido.");
  });

  createAnimatedButtonListeners(sizeUpBtn, () => {
    formState.size = clamp(Number((formState.size + 0.1).toFixed(1)), 0.6, 2.5);
    updateFormPanel();
    setStatus("Tamanho aumentado.");
  });
}

function initApp() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const initialItems = [
      createMockItem(),
      createMockItem(),
      createMockItem(),
      createMockItem()
    ];
    saveItems(initialItems);
  }

  createNameButtons();
  createColorButtons();
  bindEvents();
  updateFormPanel();
  clearSelection();
  renderScene();
  setStatus("Aplicação VR carregada com sucesso.");
}

initApp();