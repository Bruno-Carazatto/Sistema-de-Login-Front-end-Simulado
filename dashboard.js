(() => {
  "use strict";

  const ROOT_LOGIN = "index.html";

  // ====== Tema ======
  const THEME_KEY = "demo_theme";
  const btnTheme = document.getElementById("btnThemeDash");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    const isDark = theme === "dark";
    btnTheme.querySelector("i").className = isDark ? "bi bi-sun" : "bi bi-moon-stars";
    btnTheme.querySelector("span").textContent = isDark ? "Modo claro" : "Modo escuro";
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  btnTheme.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-bs-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ====== Sessão ======
  const sessionRaw = localStorage.getItem("demo_session");
  if (!sessionRaw) {
    window.location.href = ROOT_LOGIN;
    return;
  }

  let session = null;
  try {
    session = JSON.parse(sessionRaw);
  } catch {
    localStorage.removeItem("demo_session");
    window.location.href = ROOT_LOGIN;
    return;
  }

  const userEmail = session?.user?.email || "—";
  const userRole = session?.user?.role || "—";

  document.getElementById("userEmail").textContent = userEmail;
  document.getElementById("userRole").textContent = userRole;
  document.getElementById("kpiRole").textContent = userRole;

  // ====== Loader + Fade ======
  const loader = document.getElementById("appLoader");
  const content = document.getElementById("appContent");

  function showApp() {
    // some com loader e mostra conteúdo com fade
    loader.classList.add("is-hidden");
    content.classList.add("is-ready");
    content.setAttribute("aria-busy", "false");

    // remove do DOM depois do fade (limpa)
    setTimeout(() => {
      loader.remove();
    }, 350);
  }

  // ====== Dados simulados ======
  const DATA_KEY = "demo_dashboard_items";

  function seedDataIfEmpty() {
    const existing = localStorage.getItem(DATA_KEY);
    if (existing) return;

    const now = Date.now();
    const seeded = [
      { id: 1, title: "Revisar pendências", status: "pending", updatedAt: now - 1000 * 60 * 40 },
      { id: 2, title: "Conferir relatórios", status: "done", updatedAt: now - 1000 * 60 * 180 },
      { id: 3, title: "Validar acessos", status: "pending", updatedAt: now - 1000 * 60 * 15 },
      { id: 4, title: "Organizar checklist", status: "done", updatedAt: now - 1000 * 60 * 600 },
    ];

    localStorage.setItem(DATA_KEY, JSON.stringify(seeded));
  }

  function loadItems() {
    const raw = localStorage.getItem(DATA_KEY) || "[]";
    try { return JSON.parse(raw); } catch { return []; }
  }

  function saveItems(items) {
    localStorage.setItem(DATA_KEY, JSON.stringify(items));
  }

  // ====== Toast ======
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast({ title = "Aviso", message = "", type = "secondary" }) {
    const toastArea = document.getElementById("toastArea");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <strong class="me-1">${escapeHtml(title)}</strong>
            <span>${escapeHtml(message)}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
        </div>
      </div>
    `;

    const toastEl = wrapper.firstElementChild;
    toastArea.appendChild(toastEl);

    const t = new bootstrap.Toast(toastEl, { delay: 2400 });
    t.show();

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  }

  // ====== KPI ======
  function updateKpis(items) {
    const total = items.length;
    const pending = items.filter(i => i.status === "pending").length;
    const done = items.filter(i => i.status === "done").length;

    document.getElementById("kpiActivities").textContent = total;
    document.getElementById("kpiPending").textContent = pending;
    document.getElementById("kpiDone").textContent = done;
    document.getElementById("badgeCount").textContent = total;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  // ====== Render ======
  const rowsEl = document.getElementById("rows");
  const emptyState = document.getElementById("emptyState");
  const searchEl = document.getElementById("search");
  const filterStatusEl = document.getElementById("filterStatus");

  function getFilters() {
    const q = (searchEl.value || "").trim().toLowerCase();
    const st = filterStatusEl.value || "all";
    return { q, st };
  }

  function applyFilters(items) {
    const { q, st } = getFilters();
    return items.filter(it => {
      const matchText = !q || it.title.toLowerCase().includes(q);
      const matchStatus = st === "all" || it.status === st;
      return matchText && matchStatus;
    });
  }

  function statusBadge(status) {
    if (status === "done") return `<span class="badge text-bg-success">Concluído</span>`;
    return `<span class="badge text-bg-warning text-dark">Pendente</span>`;
  }

  function render() {
    const all = loadItems().sort((a, b) => b.updatedAt - a.updatedAt);
    updateKpis(all);

    const filtered = applyFilters(all);

    rowsEl.innerHTML = filtered.map(it => `
      <tr>
        <td class="text-secondary">${it.id}</td>
        <td class="fw-semibold">${escapeHtml(it.title)}</td>
        <td>${statusBadge(it.status)}</td>
        <td class="text-secondary">${formatDate(it.updatedAt)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="toggle" data-id="${it.id}">
            <i class="bi bi-arrow-repeat"></i> Alternar
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${it.id}">
            <i class="bi bi-trash"></i> Excluir
          </button>
        </td>
      </tr>
    `).join("");

    emptyState.classList.toggle("d-none", filtered.length > 0);
  }

  // ====== Interações ======
  searchEl.addEventListener("input", render);
  filterStatusEl.addEventListener("change", render);

  rowsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = Number(btn.getAttribute("data-id"));

    let items = loadItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx < 0) return;

    if (action === "toggle") {
      items[idx].status = items[idx].status === "done" ? "pending" : "done";
      items[idx].updatedAt = Date.now();
      saveItems(items);
      showToast({ title: "Atualizado!", message: "Status alterado com sucesso.", type: "info" });
      render();
      return;
    }

    if (action === "delete") {
      items = items.filter(i => i.id !== id);
      saveItems(items);
      showToast({ title: "Removido!", message: "Registro excluído (simulado).", type: "danger" });
      render();
      return;
    }
  });

  // Novo registro
  const btnNewItem = document.getElementById("btnNewItem");
  const btnCreate = document.getElementById("btnCreate");
  const newTitle = document.getElementById("newTitle");
  const newModalEl = document.getElementById("newModal");
  const newModal = new bootstrap.Modal(newModalEl);

  btnNewItem.addEventListener("click", () => {
    newTitle.value = "";
    newModal.show();
    setTimeout(() => newTitle.focus(), 150);
  });

  btnCreate.addEventListener("click", () => {
    const title = (newTitle.value || "").trim();
    if (title.length < 3) {
      showToast({ title: "Atenção", message: "Digite um título com pelo menos 3 caracteres.", type: "warning" });
      return;
    }

    const items = loadItems();
    const nextId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;

    items.push({
      id: nextId,
      title,
      status: "pending",
      updatedAt: Date.now()
    });

    saveItems(items);
    newModal.hide();
    showToast({ title: "Criado!", message: "Novo registro adicionado.", type: "success" });
    render();
  });

  // Refresh
  document.getElementById("btnRefresh").addEventListener("click", () => {
    showToast({ title: "Atualizado", message: "Dados recarregados (localStorage).", type: "secondary" });
    render();
  });

  // Links fake
  document.getElementById("btnFakePage1").addEventListener("click", (e) => {
    e.preventDefault();
    showToast({ title: "Em breve", message: "Essa página seria criada na próxima etapa.", type: "info" });
  });

  document.getElementById("btnFakePage2").addEventListener("click", (e) => {
    e.preventDefault();
    showToast({ title: "Em breve", message: "Gestão de usuários seria um módulo futuro.", type: "info" });
  });

  // Logout
  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("demo_session");
    showToast({ title: "Saindo...", message: "Sessão encerrada.", type: "secondary" });
    setTimeout(() => window.location.href = ROOT_LOGIN, 500);
  });

  // ====== Inicialização com loader (simulada) ======
  seedDataIfEmpty();

  // simula “carregar sessão + dados” (fica muito bem no vídeo/print)
  const SIMULATED_MS = 650;
  setTimeout(() => {
    render();
    showApp();
  }, SIMULATED_MS);

})();
