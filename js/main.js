const pages = {
  "index.html": "Главная",
  "services.html": "Услуги и цены",
  "recruitment.html": "Подбор персонала",
  "advertising.html": "Маркетинг",
  "about.html": "О нас",
  "careers.html": "Сотрудничество",
  "contacts.html": "Контакты"
};

const current = location.pathname.split("/").pop() || "index.html";
const headerMount = document.querySelector("[data-header]");
const footerMount = document.querySelector("[data-footer]");

if (headerMount) {
  headerMount.innerHTML = `<header class="site-header"><div class="wrap nav"><a class="brand" href="index.html">DIGITAL<i>/</i>NETWORK</a><nav class="nav-links" aria-label="Основная навигация">${Object.entries(pages).map(([url, name]) => `<a class="${current === url ? "active" : ""}" href="${url}">${name}</a>`).join("")}<a class="nav-cta" href="contacts.html#form">Обсудить задачу</a></nav><button class="menu-btn" type="button" aria-label="Открыть меню" aria-expanded="false">☰</button></div></header>`;
}

if (footerMount) {
  footerMount.innerHTML = `<footer class="site-footer"><div class="wrap"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="index.html">DIGITAL<i>/</i>NETWORK</a><p>Подбор персонала и маркетинговый консалтинг для бизнеса.</p></div><div class="footer-col"><strong>Практики</strong><a href="recruitment.html">Подбор персонала</a><a href="advertising.html">Маркетинг и digital</a><a href="services.html">Услуги и цены</a></div><div class="footer-col"><strong>Контакты</strong><a href="tel:+79000715702">+7 900 071-57-02</a><a href="mailto:luckmanovadaniya@mail.ru">luckmanovadaniya@mail.ru</a><a href="privacy.html">Политика обработки данных</a><a href="personal-data.html">Согласие на обработку данных</a></div><div class="footer-col footer-legal"><strong>Реквизиты</strong><span>ИП Лукманова Дания Рафкатовна</span><span>ИНН 451901907462</span><span>ОГРНИП 325450000030870</span><address><b>Юридический адрес</b>641084, Россия, Курганская область, Сафакулевский р-н, с. Камышное, ул. Труда, д. 11</address></div></div><div class="footer-bottom"><span>© 2025 DIGITAL NETWORK</span><span>Работаем с 2025 года</span></div></div></footer>`;
}

const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu-btn");
const links = document.querySelector(".nav-links");

addEventListener("scroll", () => header?.classList.toggle("scrolled", scrollY > 18));
menu?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  document.body.classList.toggle("menu-open", open);
  menu.textContent = open ? "×" : "☰";
  menu.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".reveal").forEach((element) => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      observer.disconnect();
    }
  }, { threshold: .1 });
  observer.observe(element);
});

const form = document.querySelector("#contact-form");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelectorAll(".error").forEach((item) => item.remove());
    let valid = true;

    form.querySelectorAll("[required]").forEach((field) => {
      const empty = field.type === "checkbox" ? !field.checked : !field.value.trim();
      if (empty) {
        valid = false;
        const error = document.createElement("div");
        error.className = "error";
        error.textContent = field.type === "checkbox" ? "Необходимо согласие на обработку данных" : "Заполните поле";
        (field.closest(".field") || field.closest(".check")).append(error);
      }
    });

    const email = form.querySelector("[type=email]");
    if (email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
      valid = false;
      const error = document.createElement("div");
      error.className = "error";
      error.textContent = "Проверьте адрес электронной почты";
      email.parentElement.append(error);
    }

    if (valid) {
      form.querySelectorAll(".field, .check, .btn").forEach((item) => item.style.display = "none");
      form.querySelector(".success").classList.add("show");
    }
  });
}
