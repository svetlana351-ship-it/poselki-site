// site.js – общее для всех страниц: мобильное меню и демо-обработка форм.
(function () {
  // мобильное меню
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // активный пункт навигации
  var current = document.body.getAttribute("data-nav");
  if (current) {
    var link = document.querySelector('.site-nav a[data-nav="' + current + '"]');
    if (link) link.setAttribute("aria-current", "page");
  }

  // формы: демо-отправка без бэкенда
  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.classList.add("is-sent");
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
})();
