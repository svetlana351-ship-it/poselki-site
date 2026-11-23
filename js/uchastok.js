// uchastok.js — детальная страница участка из window.SITE по параметру ?u=ID
(function () {
  var SITE = window.SITE;
  if (!SITE || !SITE.lots) return;

  var fmt = function (n) { return n.toLocaleString("ru-RU"); };
  var fmtArea = function (a) {
    return (a % 1 ? a.toFixed(1).replace(".", ",") : String(a)) + " сотки";
  };

  var villageById = {};
  SITE.villages.forEach(function (v) { villageById[v.id] = v; });

  var id = new URLSearchParams(location.search).get("u");
  var lot = SITE.lots.filter(function (l) { return l.id === id; })[0];

  var missing = document.getElementById("lot-missing");
  var found = document.getElementById("lot-found");

  if (!lot) {
    missing.hidden = false;
    document.title = "Участок не найден — Земля и Свет";
    return;
  }

  var v = villageById[lot.village] || { name: "", dir: "", id: "", desc: "" };

  // хлебные крошки
  var bcVillage = document.getElementById("bc-village");
  bcVillage.textContent = "«" + v.name + "»";
  bcVillage.href = "catalog.html?village=" + encodeURIComponent(lot.village);
  document.getElementById("bc-lot").textContent = "Участок " + lot.id;

  // заголовки и описание
  document.getElementById("lot-label").textContent =
    "Посёлок «" + v.name + "» · " + v.dir;
  document.getElementById("lot-title").textContent =
    "Участок " + lot.id + ", " + fmtArea(lot.area) + " — посёлок «" + v.name + "»";
  document.getElementById("lot-lead").textContent =
    lot.status + ". Цена финальная — " + fmt(lot.price) + " ₽ (" + fmt(lot.perSotka) +
    " ₽/сотка), фиксируется в договоре при брони.";
  document.getElementById("lot-desc").textContent = lot.desc;
  document.getElementById("lot-village-desc").textContent = v.desc ? "О посёлке: " + v.desc : "";

  // галерея
  document.getElementById("lot-gallery").innerHTML = lot.gallery.map(function (src, i) {
    return '<figure class="gallery__item" style="margin: 0">' +
      '<img src="' + src + '" alt="Участок ' + lot.id + ', фото ' + (i + 1) + '" ' + (i ? 'loading="lazy"' : "") + "></figure>";
  }).join("");

  // характеристики
  var specs = [
    ["Площадь", fmtArea(lot.area)],
    ["Цена", fmt(lot.price) + " ₽"],
    ["Цена за сотку", fmt(lot.perSotka) + " ₽/сотка"],
    ["Статус", lot.status],
    ["Коммуникации", lot.comm.join(", ")],
    ["Посёлок", "«" + v.name + "» · " + v.dir]
  ];
  document.getElementById("lot-specs").innerHTML = specs.map(function (row) {
    return "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
  }).join("");

  // форма заявки
  var manager = document.getElementById("lot-manager");
  if (SITE.manager) manager.textContent = SITE.manager;
  document.getElementById("lot-form-ok").textContent =
    "Заявка на просмотр участка " + lot.id + " принята. В рабочий день перезвоним, согласуем дату и время выезда — или проведём видеообход с участка.";

  // похожие участки: сначала тот же посёлок, затем остальные, не более 3
  var similar = SITE.lots.filter(function (l) { return l.id !== lot.id && l.village === lot.village; })
    .concat(SITE.lots.filter(function (l) { return l.id !== lot.id && l.village !== lot.village; }))
    .slice(0, 3);
  document.getElementById("lot-similar").innerHTML = similar.map(function (l) {
    var lv = villageById[l.village] || {};
    return '<article class="card">' +
      '<div class="card__img"><img src="' + l.gallery[0] + '" alt="Участок ' + l.id + ' в посёлке «' + lv.name + '»" loading="lazy"></div>' +
      '<div class="card__body">' +
      '<h3 class="card__title">Участок ' + l.id + '</h3>' +
      '<p class="card__meta">«' + lv.name + '» · ' + lv.dir + '</p>' +
      '<p class="card__meta">Площадь: ' + fmtArea(l.area) + ' · ' + l.status + '</p>' +
      '<p class="card__price"><b>' + fmt(l.price) + ' ₽</b> · ' + fmt(l.perSotka) + ' ₽/сотка</p>' +
      '<a class="btn btn--ghost btn--sm" href="uchastok.html?u=' + encodeURIComponent(l.id) + '">Подробнее</a>' +
      '</div></article>';
  }).join("");

  // SEO: title и description из данных
  var title = "Участок " + lot.id + ", " + fmtArea(lot.area) + " — посёлок «" + v.name + "» | Земля и Свет";
  document.title = title;
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content",
    "Участок " + lot.id + " " + fmtArea(lot.area) + " в посёлке «" + v.name + "» (" + v.dir +
    "): " + lot.status.toLowerCase() + ", " + fmt(lot.price) + " ₽ (" + fmt(lot.perSotka) +
    " ₽/сотка). Коммуникации: " + lot.comm.join(", ").toLowerCase() + ". Запись на бесплатный просмотр.");
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);

  // микроразметка JSON-LD: Product + Offer
  var ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Участок " + lot.id + ", " + fmtArea(lot.area) + " — посёлок «" + v.name + "»",
    "description": lot.desc,
    "image": lot.gallery,
    "category": "Земельный участок ИЖС",
    "offers": {
      "@type": "Offer",
      "price": lot.price,
      "priceCurrency": "RUB",
      "availability": lot.status === "Свободен" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
      "url": location.href
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Площадь, сотки", "value": String(lot.area) },
      { "@type": "PropertyValue", "name": "Цена за сотку, ₽", "value": String(lot.perSotka) },
      { "@type": "PropertyValue", "name": "Статус", "value": lot.status }
    ]
  };
  document.getElementById("lot-jsonld").textContent = JSON.stringify(ld, null, 2);

  found.hidden = false;
})();
