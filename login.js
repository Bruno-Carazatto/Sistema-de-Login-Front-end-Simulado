(() => {
  "use strict";

  // ====== Dados de login simulados ======
  const DEMO_USERS = [
    { email: "admin@demo.com", password: "admin123", role: "Admin" },
    { email: "user@demo.com",  password: "user1234", role: "Usuário" }
  ];

  // ====== Elementos ======
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btnTogglePass = document.getElementById("btnTogglePass");
  const btnLogin = document.getElementById("btnLogin");
  const spinner = btnLogin.querySelector(".spinner-border");
  const btnText = btnLogin.querySelector(".btn-text");
  const btnFillDemo = document.getElementById("btnFillDemo");

  const btnRecover = document.getElementById("btnRecover");
  const recoverEmail = document.getElementById("recoverEmail");

  const btnTheme = document.getElementById("btnTheme");

  // ====== Tema (Dark Mode) ======
  const THEME_KEY = "demo_theme";
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

  // ====== Mostrar/Ocultar senha ======
  btnTogglePass.addEventListener("click", () => {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";

    const icon = btnTogglePass.querySelector("i");
    icon.className = isHidden ? "bi bi-eye-slash" : "bi bi-eye";

    btnTogglePass.setAttribute("aria-label", isHidden ? "Ocultar senha" : "Mostrar senha");
    passInput.focus();
  });

  // ====== Auto preencher demo ======
  btnFillDemo.addEventListener("click", () => {
    emailInput.value = "admin@demo.com";
    passInput.value = "admin123";
    emailInput.focus();
  });

  // ====== Toast helper ======
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

    const t = new bootstrap.Toast(toastEl, { delay: 2600 });
    t.show();

    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  }

  // ====== Segurança básica de UI (evitar injection no toast) ======
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ====== Loader do botão ======
  function setLoading(isLoading) {
    btnLogin.disabled = isLoading;
    spinner.classList.toggle("d-none", !isLoading);
    btnText.textContent = isLoading ? "Entrando..." : "Entrar";
  }

  // ====== Simulação de login ======
  function fakeAuth(email, password) {
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, message: "Usuário não encontrado." };
    if (found.password !== password) return { ok: false, message: "Senha inválida." };
    return { ok: true, user: { email: found.email, role: found.role } };
  }

  // ====== Remember me (simples) ======
  const REMEMBER_KEY = "demo_login_email";
  const rememberMe = document.getElementById("rememberMe");
  const rememberedEmail = localStorage.getItem(REMEMBER_KEY);
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMe.checked = true;
  }

  // ====== Submit ======
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // validação Bootstrap
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showToast({ title: "Ops!", message: "Revise os campos do formulário.", type: "warning" });
      return;
    }

    const email = emailInput.value.trim();
    const password = passInput.value;

    // remember
    if (rememberMe.checked) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);

    setLoading(true);

    // simula delay de rede
    await new Promise(r => setTimeout(r, 900));

    const result = fakeAuth(email, password);
    setLoading(false);

    if (!result.ok) {
      showToast({ title: "Falha no login", message: result.message, type: "danger" });
      return;
    }

    // guarda sessão simulada
    localStorage.setItem("demo_session", JSON.stringify({
      user: result.user,
      createdAt: new Date().toISOString()
    }));

    showToast({ title: "Sucesso!", message: `Bem-vindo, ${result.user.role}.`, type: "success" });

    // redirecionamento simulado (pode virar /dashboard.html depois)
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 450);
  });

  // ====== Recuperação (modal) ======
  btnRecover.addEventListener("click", () => {
    const email = (recoverEmail.value || "").trim();
    if (!email || !email.includes("@")) {
      showToast({ title: "Atenção", message: "Digite um e-mail válido para simular o envio.", type: "warning" });
      return;
    }

    showToast({ title: "Enviado!", message: "Link de recuperação (simulado) enviado para seu e-mail.", type: "success" });
    recoverEmail.value = "";

    // fecha o modal
    const modalEl = document.getElementById("recoverModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  });

})();
