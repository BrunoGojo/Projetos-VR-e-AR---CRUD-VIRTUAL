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

  document.querySelectorAll(".name-btn").forEach(btn => {
    const btnName = btn.getAttribute("data-name");
    const isActive = btnName === formState.name;
    btn.setAttribute("color", isActive ? "#2563eb" : "#334155");
    btn.setAttribute("scale", isActive ? "1.04 1.04 1.04" : "1 1 1");
  });

  document.querySelectorAll(".color-btn").forEach(btn => {
    const color = btn.getAttribute("data-color");
    const isActive = color === formState.color;

    btn.setAttribute("scale", isActive ? "1.16 1.16 1.16" : "1 1 1");
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
      box.setAttribute("scale", "1.08 1.08 1.08");
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
  if (!buttonEl) return;

  buttonEl.addEventListener("mouseenter", () => {
    buttonEl.setAttribute(
      "animation__hover",
      "property: scale; to: 1.05 1.05 1.05; dur: 120"
    );
  });

  buttonEl.addEventListener("mouseleave", () => {
    buttonEl.setAttribute(
      "animation__leave",
      "property: scale; to: 1 1 1; dur: 120"
    );
  });

  buttonEl.addEventListener("click", () => {
    buttonEl.setAttribute(
      "animation__press",
      "property: scale; to: 0.95 0.95 0.95; dur: 80; dir: alternate; loop: 1"
    );
    onClick();
  });
}

function createNameButtons() {
  nameButtonsContainer.innerHTML = "";

  PREDEFINED_ITEMS.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;

    const x = col === 0 ? -0.76 : 0.76;
    const y = -0.78 - (row * 0.24);

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
    label.setAttribute("position", `${x} ${y - 0.01} 0.02`);
    label.setAttribute("align", "center");
    label.setAttribute("color", "#ffffff");
    label.setAttribute("width", "1.6");
    label.setAttribute("wrap-count", "20");

    btn.addEventListener("click", () => {
      formState.name = item.name;
      formState.category = item.category;
      updateFormPanel();
      setStatus(`Nome selecionado: ${item.name}`);
    });

    btn.addEventListener("mouseenter", () => {
      if (formState.name !== item.name) {
        btn.setAttribute("scale", "1.03 1.03 1.03");
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (formState.name !== item.name) {
        btn.setAttribute("scale", "1 1 1");
      }
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

    const x = -0.98 + (col * 0.36);
    const y = -1.5 - (row * 0.28);

    const btn = document.createElement("a-sphere");
    btn.setAttribute("radius", "0.085");
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
      if (formState.color !== color) {
        btn.setAttribute("scale", "1.1 1.1 1.1");
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (formState.color !== color) {
        btn.setAttribute("scale", "1 1 1");
      }
    });

    colorButtonsContainer.appendChild(btn);
  });
}

function createListCard(item, index) {
  const rowHeight = 0.44;
  const y = 0.72 - (index * rowHeight);

  const bg = document.createElement("a-plane");
  bg.setAttribute("width", "2.23");
  bg.setAttribute("height", "0.38");
  bg.setAttribute("position", `0 ${y} 0.01`);
  bg.setAttribute("color", item.id === selectedItemId ? "#1d4ed8" : "#1e293b");
  bg.setAttribute("class", "clickable");
  bg.setAttribute("data-list-id", item.id);

  const txt = document.createElement("a-text");
  txt.setAttribute("value", `${item.name}\n${item.category} | tam ${item.size}`);
  txt.setAttribute("position", `-0.90 ${y + 0.05} 0.02`);
  txt.setAttribute("align", "left");
  txt.setAttribute("color", "#ffffff");
  txt.setAttribute("width", "2");
  txt.setAttribute("wrap-count", "24");

  const colorDot = document.createElement("a-sphere");
  colorDot.setAttribute("radius", "0.055");
  colorDot.setAttribute("position", `0.82 ${y} 0.03`);
  colorDot.setAttribute("color", item.color);

  bg.addEventListener("click", () => selectItem(item.id));

  bg.addEventListener("mouseenter", () => {
    if (item.id !== selectedItemId) {
      bg.setAttribute("scale", "1.02 1.02 1.02");
    }
  });

  bg.addEventListener("mouseleave", () => {
    if (item.id !== selectedItemId) {
      bg.setAttribute("scale", "1 1 1");
    }
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
    empty.setAttribute("width", "1.7");
    vrItemsListContainer.appendChild(empty);
    return;
  }

  items.slice(0, 5).forEach((item, index) => {
    createListCard(item, index);
  });
}

function createItemEntity(item, position) {
  const entity = document.createElement("a-entity");
  const y = item.size / 2;

  entity.setAttribute("position", `${position.x} 0 ${position.z}`);
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
  label.setAttribute("position", `0 ${item.size + 0.42} 0`);
  label.setAttribute("align", "center");
  label.setAttribute("color", "#ffffff");
  label.setAttribute("width", "1.0");
  label.setAttribute("wrap-count", "18");

  const idText = document.createElement("a-text");
  idText.setAttribute("value", item.id.replace("item-", "#"));
  idText.setAttribute("position", `0 0.14 ${item.size * 0.6 + 0.26}`);
  idText.setAttribute("align", "center");
  idText.setAttribute("color", "#cbd5e1");
  idText.setAttribute("width", "0.95");

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

function calculateItemPositions(items) {
  const positions = [];
  const maxCols = 2;
  const gapX = 0.55;
  const gapZ = 0.95;
  const startZ = -3.35;

  let index = 0;
  let currentZ = startZ;

  while (index < items.length) {
    const rowItems = items.slice(index, index + maxCols);
    const rowWidths = rowItems.map(item => item.size);
    const rowDepths = rowItems.map(item => item.size);

    const totalRowWidth =
      rowWidths.reduce((sum, width) => sum + width, 0) +
      gapX * (rowItems.length - 1);

    let currentX = -totalRowWidth / 2;

    rowItems.forEach((item) => {
      const centerX = currentX + item.size / 2;

      positions.push({
        id: item.id,
        x: Number(centerX.toFixed(2)),
        z: Number(currentZ.toFixed(2))
      });

      currentX += item.size + gapX;
    });

    const deepestItem = Math.max(...rowDepths);
    currentZ -= deepestItem + gapZ;
    index += maxCols;
  }

  return positions;
}

function renderScene() {
  const items = apiGetItems();
  const positions = calculateItemPositions(items);

  itemsContainer.innerHTML = "";

  items.forEach((item) => {
    const position = positions.find(pos => pos.id === item.id);
    if (position) {
      itemsContainer.appendChild(createItemEntity(item, position));
    }
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

function increaseSize() {
  formState.size = clamp(Number((formState.size + 0.1).toFixed(1)), 0.6, 2.5);
  updateFormPanel();
  setStatus(`Tamanho aumentado para ${formState.size.toFixed(1)}.`);
}

function decreaseSize() {
  formState.size = clamp(Number((formState.size - 0.1).toFixed(1)), 0.6, 2.5);
  updateFormPanel();
  setStatus(`Tamanho reduzido para ${formState.size.toFixed(1)}.`);
}

function bindEvents() {
  createAnimatedButtonListeners(createBtn3D, handleCreate);
  createAnimatedButtonListeners(updateBtn3D, handleUpdate);
  createAnimatedButtonListeners(deleteBtn3D, handleDelete);
  createAnimatedButtonListeners(sizeDownBtn, decreaseSize);
  createAnimatedButtonListeners(sizeUpBtn, increaseSize);
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
  setStatus("VR carregada com sucesso.");
}

initApp();