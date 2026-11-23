// catalog.js — рендер и фильтрация каталога участков из window.SITE
(function () {
  var SITE = window.SITE;
  if (!SITE || !SITE.lots) return;

  var fmt = function (n) { return n.toLocaleString("ru-RU"); };
  var fmtArea = function (a) {
    return (a % 1 ? a.toFixed(1).replace(".", ",") : String(a)) + " сотки";
  };

  var cards = document.getElementById("lot-cards");
  var empty = document.getElementById("lot-empty");
  var count = document.getElementById("f-count");
  var form = document.getElementById("filters");

  var fVillage = document.getElementById("f-village");
  var fAreaFrom = document.getElementById("f-area-from");
  var fAreaTo = document.getElementById("f-area-to");
  var fPriceFrom = document.getElementById("f-price-from");
  var fPriceTo = document.getElementById("f-price-to");
  var fStatus = document.getElementById("f-status");

  // наполняем select посёлков
  SITE.villages.forEach(function (v) {
    var opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = "«" + v.name + "»";
    fVillage.appendChild(opt);
  });

  var villageById = {};
  SITE.villages.forEach(function (v) { villageById[v.id] = v; });

  var num = function (el) {
    var v = parseFloat(String(el.value).replace(/\s/g, "").replace(",", "."));
    return isNaN(v) ? null : v;
  };

  function cardHTML(lot) {
    var v = villageById[lot.village] || {};
    return '<article class="card">' +
      '<div class="card__img"><img src="' + lot.gallery[0] + '" alt="Участок ' + lot.id + ' в посёлке «' + v.name + '»" loading="lazy"></div>' +
      '<div class="card__body">' +
      '<h3 class="card__title">Участок ' + lot.id + '</h3>' +
      '<p class="card__meta">«' + v.name + '» · ' + v.dir + '</p>' +
      '<p class="card__meta">Площадь: ' + fmtArea(lot.area) + ' · ' + lot.status + '</p>' +
      '<p class="card__price"><b>' + fmt(lot.price) + ' ₽</b> · ' + fmt(lot.perSotka) + ' ₽/сотка</p>' +
      '<a class="btn btn--ghost btn--sm" href="uchastok.html?u=' + encodeURIComponent(lot.id) + '">Подробнее</a>' +
      '</div></article>';
  }

  function apply() {
    var village = fVillage.value;
    var aFrom = num(fAreaFrom), aTo = num(fAreaTo);
    var pFrom = num(fPriceFrom), pTo = num(fPriceTo);
    var status = fStatus.value;

    var found = SITE.lots.filter(function (l) {
      if (village && l.village !== village) return false;
      if (aFrom !== null && l.area < aFrom) return false;
      if (aTo !== null && l.area > aTo) return false;
      if (pFrom !== null && l.price < pFrom) return false;
      if (pTo !== null && l.price > pTo) return false;
      if (status && l.status !== status) return false;
      return true;
    });

    cards.innerHTML = found.map(cardHTML).join("");
    empty.hidden = found.length > 0;
    count.textContent = "Найдено " + found.length + " " +
      (found.length % 10 === 1 && found.length % 100 !== 11 ? "участок" :
       found.length % 10 >= 2 && found.length % 10 <= 4 && (found.length % 100 < 12 || found.length % 100 > 14) ? "участка" : "участков");
  }

  // предустановка посёлка из ?village=berezovka|lesnaya|ozero
  var preset = new URLSearchParams(location.search).get("village");
  if (preset && villageById[preset]) fVillage.value = preset;

  form.addEventListener("submit", function (e) { e.preventDefault(); apply(); });
  form.addEventListener("reset", function () {
    setTimeout(function () { apply(); }, 0);
  });

  apply();
})();
