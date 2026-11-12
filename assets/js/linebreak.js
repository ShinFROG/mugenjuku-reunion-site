// 日本語の改行を、文節（意味のまとまり）の切れ目だけにする。
// 切れ目の候補は Googleの BudouX 0.10.1（Apache License 2.0。vendor/budoux-0.10.1/ にそのまま置いた）で出し、
// 数字・漢字やカタカナの続き・地名の途中で切る候補は、下の決まりで外す（BudouXは「202|7年」「秋|葉原」のように切ることがあるため）。
// 改行してよい所に <wbr> を入れ、その段落に .bx（word-break: keep-all）を付ける。
// あとから文字が変わる所（時刻表のタブ、当日の「いま／次」など）も、変わるたびにやり直す。
import { HTMLProcessor } from "./vendor/budoux-0.10.1/html_processor.js";
import { Parser } from "./vendor/budoux-0.10.1/parser.js";
import { model } from "./vendor/budoux-0.10.1/data/models/ja.js";

const HIRA = /[ぁ-ゟ]/;
const KATA = /[ァ-ヺー-ヿｦ-ﾟ]/;
const KAN = /[㐀-䶿一-鿿豈-﫿々-〇〻]/;
const ALNUM = /[0-9A-Za-z０-９Ａ-Ｚａ-ｚ]/;
const DIGIT = /[0-9０-９]/;
const OPEN = /[（「『【〔［｛〈《(\[“‘]/;
const CLOSE_BR = /[）」』】〕］｝〉》)\]”’]/;
// 行の頭に来てはいけない字
const NO_START = /[）」』】〕］｝〉》)\]”’、。，．！？!?,.：:；;・ー…‥ゝゞヽヾぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ〜~％%]/;
// ひらがなを含む固有名詞など、途中で切らない語（漢字やカタカナだけの語は、下の決まりで切れない）
const KEEP = ["つくばエクスプレス", "つくばセンター", "つくば国際会議場", "つくば駅", "ダイワロイネットホテルつくば",
  "ホテル日航つくば", "ホテルJALシティつくば", "津軽じょんがら節", "かえで通り", "お問い合わせ", "やってほしいこと", "春分の日"];

function inKeep(text, i) {
  for (const w of KEEP) {
    let at = text.indexOf(w);
    while (at >= 0) {
      if (i > at && i < at + w.length) return true;
      at = text.indexOf(w, at + 1);
    }
  }
  return false;
}

// i 文字目の前で改行してよいか
function canBreak(text, i) {
  const a = text[i - 1], b = text[i];
  if (/\s/.test(a) || /\s/.test(b)) return false; // 空白はもともと改行できる
  if (a === "⁠" || b === "⁠") return false; // 下の glue() で「ここでは改行しない」と印を付けた所
  if (NO_START.test(b) || OPEN.test(a)) return false;
  if (DIGIT.test(a)) return false; // 2027年、8分、17:30ごろ
  if ((KAN.test(a) || /[:：.,，]/.test(a)) && DIGIT.test(b)) return false; // 年3月、第5回、9:50
  const ka = KAN.test(a) || KATA.test(a), kb = KAN.test(b) || KATA.test(b);
  if (ka && kb) return false; // 漢字・カタカナの語の途中（天久保二丁目、関東鉄道バス、デザイン棟）
  if ((ka && ALNUM.test(b)) || (ALNUM.test(a) && kb) || (ALNUM.test(a) && ALNUM.test(b))) return false; // Googleフォーム、新歓PV
  if (CLOSE_BR.test(a) && HIRA.test(b)) return false; // 」を、）の
  if (/[おご]/.test(a) && KAN.test(b)) return false; // ご返信、お知らせ
  if (/^（[月火水木金土日]）/.test(text.slice(i, i + 3))) return false; // 3月19日（金）の曜日は日付から離さない
  if (inKeep(text, i)) return false;
  return true;
}

const budoux = new Parser(model);
const phraser = {
  parseBoundaries(text) {
    const cand = new Set(budoux.parseBoundaries(text));
    for (let i = 1; i < text.length; i++) {
      if (text[i - 1] === "／" || text[i - 1] === "、" || text[i - 1] === "。") cand.add(i); // 「／」「、」「。」のあとは改行してよい
      if (OPEN.test(text[i])) cand.add(i); // かっこの前も改行してよい
    }
    return [...cand].filter((i) => i > 0 && i < text.length && canBreak(text, i)).sort((x, y) => x - y);
  },
};
const proc = new HTMLProcessor(phraser, { className: "bx", separator: document.createElement("wbr") });

// ブラウザがもともと改行してしまう所を止める
// ・「受付 9:50」「北千住 8:28」「16:00 終了予定」「6番のりば 発」の空白 → 改行しない空白（U+00A0）
// ・「」を」「）の」のような、かっこ閉じのあとの助詞、「19日（金）」の曜日の前 → 改行しない印（U+2060）
const SKIP = "script,style,noscript,textarea,input,select,option,code,pre";
function glue(root) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const t = n.data;
    if (n.parentElement && n.parentElement.closest(SKIP)) continue;
    const u = t
      .replace(/(^|[\s／（(、。：])([^\s／（(、。：]{1,3}) (\d{1,2}:\d{2})/g, "$1$2 $3") // 3字までの短い語だけ（長い地名は狭い表で時刻の途中が切れるため）
      .replace(/(\d{1,2}:\d{2}) (?=[ぁ-ヿ一-鿿])/g, "$1 ")
      .replace(/(\S) ([発着])(?=$|[\s（(／)）、。「])/g, "$1 $2")
      .replace(/([）」』】〕])(?=[ぁ-ゟ])/g, "$1⁠")
      .replace(/([0-9０-９]日)(?=（[月火水木金土日](?:・祝)?）)/g, "$1⁠");
    if (u !== t) n.data = u;
  }
}

// 切れ目の候補が1つもない段落（短い見出しなど）にも .bx を付けて、字の途中で改行しないようにする
const JA = /[ぁ-ヿ㐀-鿿]/;
function markBlocks(root) {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    if (!JA.test(n.data)) continue;
    let el = n.parentElement;
    if (!el || el.closest(SKIP)) continue;
    while (el.parentElement && getComputedStyle(el).display === "inline") el = el.parentElement;
    el.classList.add("bx");
  }
}

function apply(el) {
  glue(el);
  proc.applyToElement(el);
  markBlocks(el);
}

const body = document.body;
apply(body);

const mo = new MutationObserver((records) => {
  const targets = new Set();
  for (const r of records) {
    const el = r.type === "characterData" ? r.target.parentElement : r.target;
    if (el && el.nodeType === 1) targets.add(el);
  }
  mo.disconnect();
  for (const el of targets) {
    if (!el.isConnected) continue;
    // 変わった所を含む段落の印を外して、もう一度だけ処理する（入れ済みの <wbr> は二重にならない）
    const block = el.closest(".bx") || el;
    block.classList.remove("bx");
    apply(block);
  }
  mo.takeRecords();
  watch();
});
function watch() { mo.observe(body, { childList: true, characterData: true, subtree: true }); }
watch();
