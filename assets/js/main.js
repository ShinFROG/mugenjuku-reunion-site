// 第5回 無絃塾同窓会のページの動き。中身は data.js（window.SITE）から作る。
// 試し表示：?date=2027-01-10（その日の表示）、?time=13:30（当日の時刻）、?ki=15（期のあいさつ）、?noanim（動きなし）、?opening（オープニングをもう一度）
(function () {
  "use strict";
  var S = window.SITE || {};
  var doc = document, root = doc.documentElement;
  var params = new URLSearchParams(location.search);

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function enc(s) { return encodeURIComponent(s); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function normTime(t) { var m = /^(\d{1,2}):(\d{2})$/.exec(t || ""); return m ? pad2(+m[1]) + ":" + m[2] : null; }
  function hm(t) { return String(t).replace(/^0/, ""); }
  function utcDay(s) { var a = s.split("-"); return Date.UTC(+a[0], +a[1] - 1, +a[2]); }
  function daysBetween(a, b) { return Math.round((utcDay(b) - utcDay(a)) / 86400000); }
  var WD = ["日", "月", "火", "水", "木", "金", "土"];
  function jpDate(s) { var a = s.split("-"); return +a[0] + "年" + +a[1] + "月" + +a[2] + "日"; }
  function jpDateW(s) { return jpDate(s) + "（" + WD[new Date(utcDay(s)).getUTCDay()] + "）"; }
  function mdJP(s) { var a = s.split("-"); return +a[1] + "月" + +a[2] + "日"; }
  function ymJP(s) { var a = s.split("-"); return +a[0] + "年" + +a[1] + "月"; }
  // 締切が今日と違う年なら年も付ける
  function dueJP(s) { return s.slice(0, 4) === TODAY.slice(0, 4) ? mdJP(s) : jpDate(s); }

  // ---------- 日本時間の今日と今の時刻 ----------
  function jstNow() {
    try {
      var f = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
      var p = {};
      f.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return { date: p.year + "-" + p.month + "-" + p.day, time: (p.hour === "24" ? "00" : p.hour) + ":" + p.minute };
    } catch (e) {
      var d = new Date(Date.now() + 9 * 3600000).toISOString();
      return { date: d.slice(0, 10), time: d.slice(11, 16) };
    }
  }
  var qDate = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "") ? params.get("date") : null;
  var qTime = normTime(params.get("time"));
  var TODAY = qDate || jstNow().date;
  function nowTime() { return qTime || jstNow().time; }

  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (params.has("noanim")) root.classList.add("noanim");
  var still = reduce || root.classList.contains("noanim");

  var phases = S.phases || [];
  var phase = phases.filter(function (p) { return TODAY >= p.from && TODAY <= p.to; })[0] || phases[0] || { key: "soon", cta: {} };
  var places = S.places || {};
  var forms = S.forms || {};

  function mapUrl(q) { return "https://www.google.com/maps/search/?api=1&query=" + enc(q); }
  function walkUrl() {
    return "https://www.google.com/maps/dir/?api=1&origin=" + enc(places.a.q) + "&destination=" + enc(places.b.q) + "&travelmode=walking";
  }
  function setLink(a, href, text, external) {
    if (!a) return;
    a.setAttribute("href", href);
    if (text) a.textContent = text;
    if (external) { a.target = "_blank"; a.rel = "noopener"; }
    else { a.removeAttribute("target"); a.removeAttribute("rel"); }
  }

  // フォームの状態：before（受付前）、open（受付中）、prep（受付期間だがURLがまだ）、after（締切後）
  function formState(f) {
    if (!f) return "none";
    if (f.from && TODAY < f.from) return "before";
    if (f.to && TODAY > f.to) return "after";
    return f.url ? "open" : "prep";
  }

  // ---------- 時期で変わるトップ ----------
  function phaseCta() {
    var c = phase.cta || {};
    var out = { text: c.text || "これからの予定を見る", short: c.short || c.text, href: c.href || "#schedule", ext: false };
    if (c.form) {
      var f = forms[c.form];
      if (formState(f) === "open") { out.href = f.url; out.ext = true; }
      else { out.href = c.fallback || "#schedule"; if (c.fallbackText) out.text = out.short = c.fallbackText; }
    } else if (c.map) {
      var key = (phase.key === "today" && nowTime() >= "12:50") ? "b" : c.map;
      var pl = places[key];
      if (pl) { out.href = mapUrl(pl.q); out.ext = true; out.text = "地図アプリで" + pl.name + "を開く"; out.short = "会場の地図"; }
    }
    return out;
  }
  function applyCta() {
    var cta = phaseCta();
    setLink($("#heroCta"), cta.href, cta.text, cta.ext);
    setLink($("#floatCta"), cta.href, cta.text, cta.ext);
    setLink($("#navCta"), cta.href, cta.short, cta.ext);
  }
  function applyPhase() {
    var chip = $("#phaseChip"); if (chip) chip.textContent = phase.label || "";
    var lead = $("#phaseLead"); if (lead) lead.textContent = phase.lead || "";
    var track = $("#band"), items = phase.band || [];
    if (track && items.length) {
      var list = items.slice();
      while (list.length < 8) list = list.concat(items);
      var one = list.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
      track.innerHTML = one + one;
    }
    var badge = $("#heroBadge"), d = daysBetween(TODAY, S.event.date);
    if (badge) {
      if (d > 0) $("#heroDays").textContent = d;
      else if (d === 0) badge.innerHTML = "<small>いよいよ</small><b>本日</b>";
      else badge.hidden = true;
    }
  }
  function greet() {
    var ki = parseInt(params.get("ki"), 10), g = $("#kiGreet");
    if (g && ki >= 1 && ki <= 40) { g.textContent = "第" + ki + "期のみなさん、おひさしぶりです。"; g.hidden = false; }
  }

  // ---------- 「やってほしいこと」募集（いまの主題） ----------
  function buildIdeas() {
    var sec = $("#ideas"), f = forms.ideas;
    if (!sec || !f) return;
    var st = formState(f), late = ["rsvp", "final", "today", "after"].indexOf(phase.key) >= 0;
    if (late) { sec.hidden = true; return; }
    var state = $("#ideasState"), lead = $("#ideasLead"), period = $("#ideasPeriod"), act = $("#ideasAction");
    if (period) period.textContent = ymJP(f.from) + "〜" + dueJP(f.to) + "（" + WD[new Date(utcDay(f.to)).getUTCDay()] + "）";
    if (st === "before") {
      if (state) state.textContent = ymJP(f.from) + "から募集します";
      if (act) act.innerHTML = '<span class="btn ideas-btn is-off">受付は' + ymJP(f.from) + "から</span>";
    } else if (st === "open") {
      if (state) state.textContent = "募集中（" + dueJP(f.to) + "まで）";
      if (act) act.innerHTML = '<a class="btn btn-white ideas-btn" href="' + esc(f.url) + '" target="_blank" rel="noopener">「やってほしいこと」を送る</a>';
    } else if (st === "after") {
      if (state) state.textContent = "募集は終わりました";
      if (lead) lead.textContent = "たくさんの声をありがとうございました。いただいた声をもとに、実行委員会で準備を進めています。";
      if (act) act.innerHTML = "";
    } else {
      if (state) state.textContent = "まもなく募集します";
      if (act) act.innerHTML = '<span class="btn ideas-btn is-off">フォームは準備中です</span>';
    }
  }

  // ---------- 開催概要：カレンダーと申込 ----------
  function buildCalendar() {
    var g = $("#calGrid"); if (!g) return;
    var a = S.event.date.split("-"), y = +a[0], m = +a[1], day = +a[2];
    var first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    var last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var h = "";
    WD.forEach(function (w, i) { h += '<span class="w' + (i === 0 ? " sun" : i === 6 ? " sat" : "") + '">' + w + "</span>"; });
    for (var i = 0; i < first; i++) h += "<span></span>";
    for (var d = 1; d <= last; d++) {
      var dow = (first + d - 1) % 7, c = "d";
      if (dow === 0) c += " sun";
      if (dow === 6) c += " sat";
      if (d === day) c += " day";
      if (d === day + 1) c += " hol";
      h += '<span class="' + c + '">' + d + "</span>";
    }
    g.innerHTML = h;
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", y + "年" + m + "月のカレンダー。" + m + "月" + day + "日（日）が同窓会の当日、翌日は春分の日（予定）。");
  }
  function utcStamp(date, time) {
    var a = date.split("-"), t = time.split(":");
    return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2], +t[0] - 9, +t[1])).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function calendarLink() {
    var a = $("#gcalBtn"); if (!a || !S.event) return;
    var e = S.event;
    var details = "受付 9:50（未来社会デザイン棟）\n13:15から開学記念館\n16:00 終了予定（二次会は17:30ごろから・場所は調整中）\n" + S.url;
    a.href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + enc("第5回 無絃塾同窓会") +
      "&dates=" + utcStamp(e.date, e.start) + "/" + utcStamp(e.date, e.end) +
      "&details=" + enc(details) + "&location=" + enc("筑波大学 未来社会デザイン棟（午前）・開学記念館（午後）");
  }
  function formButton(url, text, cls) {
    return '<a class="btn btn-small ' + (cls || "btn-red") + ' fact-btn" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>";
  }
  function buildApply() {
    var dd = $("#factApply"); if (!dd) return;
    var ideas = forms.ideas, rsvp = forms.rsvp;
    var si = formState(ideas), sr = formState(rsvp), h = "";
    if (sr === "open") {
      h = "<b>出欠を受付中です</b><span>締切は" + jpDateW(rsvp.to) + "です。</span>" + formButton(rsvp.url, "出欠を回答する");
    } else if (sr === "prep") {
      h = "<b>出欠の受付をまもなく始めます</b><span>出欠フォームは準備中です。締切は" + jpDateW(rsvp.to) + "の予定です。</span>";
    } else if (sr === "after") {
      h = "<b>出欠の受付は締め切りました</b><span>たくさんのご回答、ありがとうございました。</span>";
    } else if (rsvp) {
      h = "<b>出欠の受付は" + ymJP(rsvp.from) + "ごろから</b><span>締切は" + jpDateW(rsvp.to) + "の予定です。</span>";
      if (si === "before") h += "<span>その前に、" + ymJP(ideas.from) + "から" + dueJP(ideas.to) + "まで「やってほしいこと」を募集します。</span>";
      else if (si === "open") h += "<span>いま「やってほしいこと」を募集しています（" + dueJP(ideas.to) + "まで）。</span>" + formButton(ideas.url, "「やってほしいこと」を送る");
      else if (si === "after") h += "<span>「やってほしいこと」の募集は終わりました。ありがとうございました。</span>";
    }
    if (h) dd.innerHTML = h;
  }

  // ---------- お知らせ ----------
  function buildNews() {
    var ul = $("#newsList"); if (!ul) return;
    var items = (S.news || []).filter(function (n) { return n.date <= TODAY; });
    if (!items.length) { ul.innerHTML = "<li>まだお知らせはありません。</li>"; return; }
    ul.innerHTML = items.map(function (n) {
      var age = daysBetween(n.date, TODAY);
      return '<li><time datetime="' + esc(n.date) + '">' + esc(n.date.replace(/-/g, ".")) + "</time>" +
        (age <= 30 ? '<span class="new">NEW</span>' : "") + "<span>" + esc(n.text) + "</span></li>";
    }).join("");
  }

  // ---------- 当日の流れ ----------
  var VENUE = {
    a: { cls: "v-a", label: "午前　未来社会デザイン棟" },
    b: { cls: "v-b", label: "午後　開学記念館" },
    night: { cls: "v-night", label: "夜　二次会（場所は調整中）" }
  };
  function buildChapters() {
    var ol = $("#chapters"); if (!ol) return;
    var last = null, h = "";
    (S.program || []).forEach(function (p) {
      var v = VENUE[p.venue];
      if (v && p.venue !== last) { h += '<li class="venue-row ' + v.cls + ' reveal">' + esc(v.label) + "</li>"; last = p.venue; }
      var cls = "ch reveal " + (v ? v.cls : "v-move") + (p.hi ? " hi" : "");
      h += '<li class="' + cls + '" data-t="' + esc(p.t) + '"><div class="tm"><small>' + (p.t < "12:00" ? "AM" : "PM") + "</small><b>" + esc(hm(p.t)) +
        '</b></div><span class="dot" aria-hidden="true"></span><div class="body"><b>' + esc(p.title) + "</b><p>" + esc(p.text) + "</p></div></li>";
    });
    ol.innerHTML = h;
  }
  function renderNow() {
    var box = $("#todayNow"); if (!box) return;
    if (phase.key !== "today") { box.hidden = true; return; }
    var t = nowTime(), prog = S.program || [], cur = null, next = null;
    for (var i = 0; i < prog.length; i++) {
      if (prog[i].t <= t) cur = prog[i]; else { next = prog[i]; break; }
    }
    var h = cur ? "<span>いま</span><b>" + esc(hm(cur.t)) + "　" + esc(cur.title) + "</b>" : "<span>まもなく始まります</span>";
    if (next) h += "<span>次は " + esc(hm(next.t)) + "　" + esc(next.title) + "</span>";
    box.innerHTML = h;
    box.hidden = false;
    $$("#chapters .ch").forEach(function (li) { li.classList.toggle("now", !!cur && li.getAttribute("data-t") === cur.t); });
  }

  // ---------- アクセス ----------
  function buildMaps() {
    var box = $("#mapLinks");
    if (box) {
      box.innerHTML = ["a", "b", "center", "heisa", "amakubo", "nishi"].filter(function (k) { return places[k]; }).map(function (k) {
        return '<a href="' + mapUrl(places[k].q) + '" target="_blank" rel="noopener">' + esc(places[k].name) + "</a>";
      }).join("");
    }
    var w = $("#walkRoute"); if (w && places.a && places.b) w.href = walkUrl();
    $$(".venue-map[data-place]").forEach(function (a) {
      var p = places[a.getAttribute("data-place")];
      if (p) a.href = mapUrl(p.q);
    });
  }
  function buildGmap() {
    var tabs = $("#gmapTabs"), frame = $("#gmapFrame"), cap = $("#gmapCap"), M = S.maps || [];
    if (!tabs || !frame || !M.length) return;
    tabs.innerHTML = M.map(function (x, i) {
      return '<button type="button" role="tab" data-i="' + i + '">' + esc(x.tab) + "</button>";
    }).join("");
    function show(i) {
      $$("button", tabs).forEach(function (b) {
        var on = +b.getAttribute("data-i") === i;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      frame.src = M[i].src;
      if (cap) cap.textContent = M[i].cap;
    }
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) show(+b.getAttribute("data-i"));
    });
    show(0);
  }
  function buildTimetable() {
    var T = S.transit, tabs = $("#ttTabs"), body = $("#ttBody");
    if (!T || !tabs || !body) return;
    var keys = ["go", "move", "back"].filter(function (k) { return T[k]; });
    tabs.innerHTML = keys.map(function (k) {
      return '<button type="button" role="tab" id="tt-' + k + '" aria-controls="ttBody" data-k="' + k + '">' + esc(T[k].title) + "</button>";
    }).join("");
    body.setAttribute("role", "tabpanel");
    function lineClass(l) { return /右回り/.test(l) ? "r" : /左回り/.test(l) ? "l" : "t"; }
    function show(k, focus) {
      $$("button", tabs).forEach(function (b) {
        var on = b.getAttribute("data-k") === k;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      var d = T[k], h = '<p class="tt-intro">' + esc(d.intro) + "</p>";
      if (k === "move" && places.a && places.b) h += '<p><a class="btn btn-small btn-ink" href="' + walkUrl() + '" target="_blank" rel="noopener">徒歩ルートを地図アプリで開く</a></p>';
      (d.groups || []).forEach(function (g) {
        h += '<div class="tt-group"><h4>' + esc(g.name) + '</h4><div class="tt-rows">';
        g.rows.forEach(function (r) {
          h += '<div class="tt-row' + (r.mark ? " " + r.mark : "") + '"><span class="dep">' + esc(r.dep) + '</span><span class="ln ' + lineClass(r.line) + '">' + esc(r.line) + "</span>" +
            (r.to ? '<span class="to">' + esc(r.to) + "</span>" : "") + (r.note ? '<span class="tag">' + esc(r.note) + "</span>" : "") + "</div>";
        });
        h += "</div></div>";
      });
      if (d.tip) h += '<p class="tt-tip">' + esc(d.tip) + "</p>";
      body.innerHTML = h;
      body.setAttribute("aria-labelledby", "tt-" + k);
    }
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]");
      if (b) show(b.getAttribute("data-k"));
    });
    tabs.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var on = $("button.on", tabs), i = keys.indexOf(on ? on.getAttribute("data-k") : keys[0]);
      show(keys[(i + (e.key === "ArrowRight" ? 1 : keys.length - 1)) % keys.length], true);
      e.preventDefault();
    });
    show(phase.key === "after" || (phase.key === "today" && nowTime() >= "15:30") ? "back" : "go");
    var src = $("#ttSrc");
    if (src) {
      src.innerHTML = "時刻は" + esc(T.checked) + "に確かめた日曜・祝日のダイヤです。開催の2か月前（" + esc(T.next) + "）に、最新の時刻へ更新します。出典：" +
        (T.sources || []).map(function (s) { return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a>"; }).join("、");
    }
  }
  function buildWays() {
    var box = $("#ways"); if (!box) return;
    box.innerHTML = (S.ways || []).map(function (w) {
      return '<div class="way reveal"><i aria-hidden="true">' + esc(w.icon) + "</i><b>" + esc(w.title) + "</b><p>" + esc(w.text) + "</p></div>";
    }).join("");
  }
  function buildHotels() {
    var wrap = $("#stay"), box = $("#hotels"); if (!wrap || !box) return;
    var hs = S.hotels || [];
    if (!hs.length) { wrap.hidden = true; return; }
    box.innerHTML = hs.map(function (x) {
      var inner = "<b>" + esc(x.name) + '</b><span class="walk">' + esc(x.access) + "</span>" +
        (x.note ? '<span class="hnote">' + esc(x.note) + "</span>" : "") + (x.url ? '<span class="go">公式サイトを開く ↗</span>' : "");
      return x.url ? '<a class="hotel reveal" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + inner + "</a>" : '<div class="hotel reveal">' + inner + "</div>";
    }).join("");
    var src = $("#hotelsSrc");
    if (src && S.hotelsChecked) src.textContent = "駅からの時間は、各ホテルの公式サイトの記載です（" + S.hotelsChecked + "に確認）。";
    wrap.hidden = false;
    var fh = $("#faqHotels"); if (fh) fh.hidden = false;
  }

  // ---------- 関連リンク ----------
  function buildLinks() {
    var box = $("#relatedList"), L = S.links || [];
    if (!box) return;
    if (!L.length) { $("#related").hidden = true; return; }
    box.innerHTML = L.map(function (x) {
      return '<a class="rel" href="' + esc(x.url) + '" target="_blank" rel="noopener"><span class="rel-k">' + esc(x.kind) + "</span><b>" + esc(x.title) + "</b><span class=\"rel-s\">" + esc(x.sub) + "</span></a>";
    }).join("");
  }

  // ---------- 無絃塾のYouTube ----------
  // トップの写真の下に2026新歓PVを置く。自動では流さず、▶を押したら音ありで最初から流れる
  function pvVideo() {
    var Y = S.youtube || {}, V = Y.hero, holder = $("#pvPlayer");
    var yt = $("#pvYt");
    if (yt && V && V.id) yt.href = "https://www.youtube.com/watch?v=" + V.id;
    if (!V || !V.id || !holder) return;
    var f = doc.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(V.id) + "?rel=0&playsinline=1";
    f.title = "無絃塾 " + (V.title || "動画");
    f.loading = "lazy";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    holder.replaceWith(f);
  }
  function buildVideos() {
    var Y = S.youtube || {}, box = $("#vids"), sec = $("#videos");
    var ch = $("#ytChannel"); if (ch && Y.channel) ch.href = Y.channel;
    if (!box) return;
    var P = Y.picks || [];
    if (!P.length) { if (sec) sec.hidden = true; return; }
    box.innerHTML = P.map(function (v) {
      return '<div class="vid reveal"><button type="button" class="vid-frame" data-id="' + esc(v.id) + '" aria-label="' + esc(v.title) + 'を再生">' +
        '<img src="https://i.ytimg.com/vi/' + esc(v.id) + '/hqdefault.jpg" alt="" loading="lazy"><span class="vid-play" aria-hidden="true"></span></button>' +
        '<b class="vid-title">' + esc(v.title) + '</b><span class="vid-date">' + esc(v.date) + "</span></div>";
    }).join("");
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button.vid-frame[data-id]"); if (!b) return;
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(b.getAttribute("data-id")) + "?autoplay=1&rel=0&playsinline=1";
      f.title = b.getAttribute("aria-label");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      var div = doc.createElement("div");
      div.className = "vid-frame";
      div.appendChild(f);
      b.replaceWith(div);
    });
  }

  // ---------- これまでの写真（横スクロールのボタン） ----------
  function galleryButtons() {
    var g = $("#gallery"); if (!g) return;
    var prev = $(".gal-prev"), next = $(".gal-next");
    function step(dir) { g.scrollBy({ left: dir * g.clientWidth * 0.8, behavior: still ? "auto" : "smooth" }); }
    function upd() {
      if (prev) prev.disabled = g.scrollLeft < 8;
      if (next) next.disabled = g.scrollLeft + g.clientWidth > g.scrollWidth - 8;
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
    g.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    upd();
  }

  // ---------- 期ごとの参加状況 ----------
  function buildGens() {
    var g = S.generations || [], box = $("#gensBox");
    if (!box || !g.length) return;
    var max = Math.max.apply(null, g.map(function (x) { return x.yes; })) || 1, total = 0;
    g.forEach(function (x) { total += x.yes; });
    box.innerHTML = '<p class="gens-total">いま <b>' + total + "</b> 人が参加の予定です（名前は出しません）。</p>" +
      '<div class="gens-chart">' + g.map(function (x) {
        return '<div class="g"><span class="n">' + x.yes + '</span><span class="bar" style="height:' + Math.max(6, Math.round(x.yes / max * 160)) + 'px"></span><span>' + esc(x.ki) + "期</span></div>";
      }).join("") + "</div>";
  }

  // ---------- これからの予定 ----------
  function buildRoad() {
    var items = $$("#road li"), nextMarked = false;
    items.forEach(function (li) {
      var from = li.getAttribute("data-from"), to = li.getAttribute("data-to");
      li.classList.remove("now", "next", "done");
      if (TODAY > to) li.classList.add("done");
      else if (TODAY >= from) li.classList.add("now");
      else if (!nextMarked) { li.classList.add("next"); nextMarked = true; }
      var f = forms[li.getAttribute("data-form")];
      if (!f) return;
      var st = formState(f), el = null;
      if (st === "open") {
        el = doc.createElement("a");
        el.href = f.url; el.target = "_blank"; el.rel = "noopener";
        el.textContent = "フォームを開く";
      } else if (st === "prep") {
        el = doc.createElement("span");
        el.textContent = "フォームは準備中です";
      }
      if (el) { el.className = "road-form"; li.appendChild(el); }
    });
  }

  // ---------- Q&A、送る、問い合わせ ----------
  function faqToggle() {
    var b = $("#faqAll"); if (!b) return;
    b.addEventListener("click", function () {
      var ds = $$(".faq details"), openAll = ds.some(function (d) { return !d.open; });
      ds.forEach(function (d) { d.open = openAll; });
      b.textContent = openAll ? "すべて閉じる" : "すべて開く";
    });
  }
  function inviteText() {
    var lines = ["【第5回 無絃塾同窓会】", "2028年3月19日（日）、筑波大学（未来社会デザイン棟・開学記念館）で開きます。"];
    if (phase.key === "ideas" && forms.ideas) lines.push("いま「やってほしいこと」を募集しています（" + dueJP(forms.ideas.to) + "まで）。");
    if (phase.key === "rsvp" && forms.rsvp) lines.push("出欠を受付中です（" + jpDate(forms.rsvp.to) + "まで）。");
    lines.push("くわしくはこちら：" + S.url);
    return lines.join("\n");
  }
  function fallbackCopy(t) {
    try {
      var ta = doc.createElement("textarea");
      ta.value = t; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      doc.body.appendChild(ta); ta.select();
      var ok = doc.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }
  function share() {
    var msg = inviteText();
    var line = $("#shareLine"); if (line) line.href = "https://line.me/R/share?text=" + enc(msg);
    var btn = $("#copyMsg"), note = $("#copyNote"); if (!btn) return;
    btn.addEventListener("click", function () {
      function done(ok) {
        if (note) note.textContent = ok ? "コピーしました。LINEやメールに貼りつけてください。" : "コピーできませんでした。このページのURLを送ってください。";
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(msg).then(function () { done(true); }, function () { done(fallbackCopy(msg)); });
      else done(fallbackCopy(msg));
    });
  }
  function contactForm() {
    var f = forms.contact, p = $("#contactForm");
    if (!p || !f || !f.url) return;
    p.innerHTML = formButton(f.url, "お問い合わせフォーム", "btn-ink");
    p.hidden = false;
  }
  function lineBanner() {
    if (!/\bLine\//i.test(navigator.userAgent)) return;
    var bar = $("#lineBanner"); if (!bar) return;
    try { if (sessionStorage.getItem("mg5-line-closed") === "1") return; } catch (e) {}
    try { var u = new URL(location.href); u.searchParams.set("openExternalBrowser", "1"); $("#openExternal").href = u.toString(); } catch (e) {}
    bar.hidden = false;
    $("#lineBannerClose").addEventListener("click", function () {
      bar.hidden = true;
      try { sessionStorage.setItem("mg5-line-closed", "1"); } catch (e) {}
    });
  }

  // ---------- ナビ、追従ボタン ----------
  function nav() {
    var menu = $("#menu"), links = $("#links");
    if (menu && links) {
      menu.addEventListener("click", function () {
        var o = links.classList.toggle("open");
        menu.setAttribute("aria-expanded", o ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) { links.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); }
      });
    }
    if (!("IntersectionObserver" in window)) return;
    var map = {};
    $$("#links a").forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$("#links a").forEach(function (a) { a.classList.remove("on"); });
        if (map[e.target.id]) map[e.target.id].classList.add("on");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
  }
  function floatCta() {
    var fl = $("#floatCta"), hero = $(".hero"), foot = $(".foot");
    if (!fl || !hero || !("IntersectionObserver" in window)) return;
    var heroIn = true, footIn = false;
    function upd() { fl.classList.toggle("show", !heroIn && !footIn); }
    new IntersectionObserver(function (es) { heroIn = es[0].isIntersecting; upd(); }).observe(hero);
    if (foot) new IntersectionObserver(function (es) { footIn = es[0].isIntersecting; upd(); }).observe(foot);
  }

  // ---------- 動き ----------
  function reveal() {
    var els = $$(".reveal");
    if (still || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    els.forEach(function (e) {
      var sib = Array.prototype.filter.call(e.parentNode.children, function (x) { return x.classList.contains("reveal"); });
      var i = sib.indexOf(e);
      if (i > 0) e.style.transitionDelay = Math.min(i, 4) * 70 + "ms";
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.classList.add("in");
        // 出終わったら元のクラスに戻して、ホバーの動きを軽くする
        el.addEventListener("transitionend", function end() {
          el.removeEventListener("transitionend", end);
          el.classList.remove("reveal", "in");
          el.style.transitionDelay = "";
        });
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  }
  function petals() {
    var box = $("#petals"); if (!box || still) return;
    var n = innerWidth < 640 ? 9 : 16, h = "";
    for (var i = 0; i < n; i++) {
      var s = 8 + Math.random() * 9;
      h += '<span class="petal" style="left:' + (Math.random() * 100).toFixed(1) + "%;width:" + s.toFixed(1) + "px;height:" + (s * 0.8).toFixed(1) +
        "px;animation-duration:" + (9 + Math.random() * 9).toFixed(1) + "s;animation-delay:-" + (Math.random() * 16).toFixed(1) + "s;opacity:" + (0.5 + Math.random() * 0.45).toFixed(2) + '"></span>';
    }
    box.innerHTML = h;
  }
  function opening() {
    var op = $("#opening"); if (!op) return;
    var force = params.has("opening"), seen = false;
    try { seen = localStorage.getItem("mg5-opening") === "1"; } catch (e) { seen = true; }
    if (!force && (still || seen || params.has("noopen"))) return;
    try { localStorage.setItem("mg5-opening", "1"); } catch (e) {}
    op.hidden = false;
    root.classList.add("opening-on");
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      op.classList.add("out");
      root.classList.remove("opening-on");
      setTimeout(function () { op.hidden = true; }, 550);
    }
    setTimeout(function () { op.classList.add("go"); }, 300);
    setTimeout(close, 2700);
    op.addEventListener("click", close);
    doc.addEventListener("keydown", function k() { doc.removeEventListener("keydown", k); close(); });
  }

  // ---------- 実行 ----------
  lineBanner();
  greet();
  applyPhase();
  applyCta();
  buildIdeas();
  buildCalendar();
  calendarLink();
  buildApply();
  buildNews();
  buildChapters();
  renderNow();
  buildMaps();
  buildGmap();
  buildTimetable();
  buildWays();
  buildHotels();
  buildGens();
  buildVideos();
  galleryButtons();
  buildLinks();
  buildRoad();
  faqToggle();
  share();
  contactForm();
  nav();
  floatCta();
  petals();
  pvVideo();
  reveal();
  opening();
  var up = $("#updated"); if (up && S.updated) up.textContent = jpDate(S.updated);
  if (qDate || qTime) {
    var pb = doc.createElement("div");
    pb.className = "preview-date";
    pb.textContent = "試し表示：" + TODAY + (qTime ? " " + qTime : "");
    doc.body.appendChild(pb);
  }
  if (phase.key === "today" && !qTime) setInterval(function () { renderNow(); applyCta(); }, 60000);
})();
