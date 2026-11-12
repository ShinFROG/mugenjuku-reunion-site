(function () {
  "use strict";
  var S = window.SITE || {};
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function dt(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // カウントダウン
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var n = Math.round((dt(el.getAttribute("data-countdown")) - today) / 864e5);
    var pre = el.getAttribute("data-prefix") || "あと ";
    if (n > 0) el.textContent = pre + n + " 日";
    else if (n === 0) el.textContent = "今日です！";
    else el.textContent = el.getAttribute("data-prefix") ? "締め切りました" : "ありがとうございました";
  });

  // メニュー（スマホ）
  var menu = document.getElementById("menu"), links = document.getElementById("links");
  if (menu) {
    menu.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { links.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); });
    });
  }

  // スクロールで出てくる（?noanim を付けると最初から全部表示。画面の確認用）
  var noAnim = /noanim/.test(location.search + location.hash);
  var io = !noAnim && "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  document.querySelectorAll(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    if (io) io.observe(el); else el.classList.add("in");
  });

  // いま見ている場所をナビで示す
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".links a"));
  var secs = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var floatCta = document.querySelector(".float-cta");
  function onScroll() {
    var y = window.scrollY + 120, cur = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
    if (floatCta) floatCta.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 会場
  function fillVenue(id, v) {
    var el = document.getElementById(id);
    if (!el || !v) return;
    el.innerHTML = v.rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") +
      "<dt>地図</dt><dd><a href='https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(v.map) + "' target='_blank' rel='noopener'>Googleマップで開く</a></dd>";
  }
  if (S.venues) { fillVenue("venueA", S.venues.a); fillVenue("venueB", S.venues.b); }

  // 地図
  var frame = document.getElementById("mapFrame");
  function showMap(k) {
    if (!frame || !S.venues || !S.venues[k]) return;
    frame.src = "https://maps.google.com/maps?q=" + encodeURIComponent(S.venues[k].map) + "&z=16&output=embed";
    document.querySelectorAll(".map-tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-map") === k); });
  }
  document.querySelectorAll(".map-tabs button").forEach(function (b) {
    b.addEventListener("click", function () { showMap(b.getAttribute("data-map")); });
  });
  showMap("a");

  // 行き方
  if (S.ways) {
    [["wayTrain", "train"], ["wayBus", "bus"], ["wayWalk", "walk"], ["wayCar", "car"]].forEach(function (p) {
      var el = document.getElementById(p[0]); if (el && S.ways[p[1]]) el.textContent = S.ways[p[1]];
    });
    var fc = document.getElementById("faqCar"); if (fc && S.ways.car) fc.textContent = S.ways.car;
  }

  // バスの時刻
  var busTabs = document.getElementById("busTabs"), busBody = document.getElementById("busBody"), busNote = document.getElementById("busNote");
  if (busNote && S.bus) busNote.textContent = S.bus.note || "";
  function showBus(i) {
    var t = S.bus.tabs[i];
    busTabs.querySelectorAll("button").forEach(function (b, j) { b.classList.toggle("on", i === j); });
    var times = (t.times || []).map(function (x) {
      var cls = x.best ? "best" : (x.last ? "last" : "");
      var tag = x.best ? "おすすめ" : (x.last ? "最終" : (x.note || ""));
      return "<span class='" + cls + "'>" + esc(x.t) + (tag ? "<small>" + esc(tag) + "</small>" : "") + "</span>";
    }).join("");
    busBody.innerHTML = "<p class='route'>" + esc(t.route || "") + "</p><div class='times'>" + times + "</div>" + (t.tip ? "<p class='bus-tip'>" + esc(t.tip) + "</p>" : "");
  }
  if (busTabs && S.bus && S.bus.tabs && S.bus.tabs.length) {
    busTabs.innerHTML = S.bus.tabs.map(function (t, i) { return "<button role='tab' data-i='" + i + "'>" + esc(t.label) + "</button>"; }).join("");
    busTabs.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { showBus(+b.getAttribute("data-i")); }); });
    showBus(0);
  } else if (busBody) {
    busBody.innerHTML = "<p class='route'>バスの時刻は、いま調べています。わかりしだい載せます。</p>";
  }

  // これからの予定：いまここ
  var road = document.querySelectorAll("#road li"), found = false;
  road.forEach(function (li) {
    var from = dt(li.getAttribute("data-from")), to = dt(li.getAttribute("data-to"));
    if (today > to) li.classList.add("done");
    else if (!found && today >= from) { li.classList.add("now"); found = true; }
  });
  if (!found) { for (var i = 0; i < road.length; i++) { if (!road[i].classList.contains("done")) { road[i].classList.add("next"); break; } } }

  // LINEで送る・URLをコピー
  var pageUrl = location.href.split("#")[0].split("?")[0];
  var line = document.getElementById("shareLine");
  if (line) line.href = "https://social-plugins.line.me/lineit/share?url=" + encodeURIComponent(pageUrl);
  var copy = document.getElementById("copyUrl"), msg = document.getElementById("copyMsg");
  if (copy) copy.addEventListener("click", function () {
    function done(ok) { if (msg) msg.textContent = ok ? "コピーしました。LINEやメールに貼り付けてください。" : pageUrl; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pageUrl).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  var up = document.getElementById("updated"); if (up && S.updated) up.textContent = S.updated;
})();
