# 第5回 無絃塾同窓会 OBOG向けサイト

2028年3月19日（日）の第5回無絃塾同窓会の、OB・OG向けの案内ページです。HTML・CSS・JavaScriptだけで作った静的なサイトで、ビルドは要りません。

- 作成：2026-11-12。見た目は、ユーザーが選んだ「B案（明るい写真中心）」。
- 公開：まだしていない。いまは非公開のGitHubリポジトリ（ShinFROG）に置いている。同窓会用のアカウントができたら移し、そこで公開（GitHub Pagesなど）する。公開の前に、必ず本人の了承を取る。
- Claudeのページ（claude.aiのArtifact）では公開しない。

## ファイル

| ファイル | 中身 |
|---|---|
| `index.html` | ページ本体（文章はここ） |
| `assets/css/style.css` | 見た目 |
| `assets/js/data.js` | 会場・行き方・バスの時刻（ここを書き換えると、アクセスの欄が変わる） |
| `assets/js/main.js` | カウントダウン、地図とバスのタブ、スクロールの動き、LINEで送る |
| `assets/img/` | 写真（2004〜2015年の舞台の遠景。顔が分からないものだけ。トップはぼかしを入れて表示） |

## 写真

元の写真は `H_personal/Mugenjuku/90_received/old_hdd_archive/同窓会写真/` にある。長い辺を1800pxにしてJPEG（品質78）にした。

| ファイル | 元の写真 |
|---|---|
| hero_sakura.jpg | 2008/2008/卒公.JPG |
| dance_sakura.jpg | 2006/第９回卒業公演/…明日があるさ (25).JPG |
| dance_red.jpg | 2006/第９回卒業公演/…秋田甚句 (8).JPG |
| dance_kids.jpg | 2006/第９回卒業公演/…対決の前振り (43).JPG |
| stage_neputa.jpg | 2006/第９回卒業公演/…よさこい鳴子踊り (26).JPG |
| stage_blue.jpg | 2004年度/第7回卒業公演/…北海盆唄) (5).JPG |
| stage_banners.jpg | 2004年度/第7回卒業公演/…秋田音頭) (2).JPG |
| stage_lights.jpg | 2004年度/2004学祭 (2).jpg |
| umbrella_dance.jpg | 2011/第14回卒業公演　当日 (139).JPG |
| group_white.jpg | 2012/NHK撮影.JPG |
| stage_national.jpg | 2015/IMG_9928.JPG |
| sunset.jpg | 2006/その他/2006秋、海ツアー (31).JPG |

## 見た目の確かめ方

`index.html` をブラウザで開く。スクロールの動きを止めて全部を表示するときは、末尾に `?noanim` を付ける。

## 更新するとき

- 日程・企画・Q&Aの文章：`index.html`
- 会場の住所、バスの時刻、注意書き：`assets/js/data.js`
- 最終更新日：`assets/js/data.js` の `updated`
- 2028年のバスの時刻は、直前（2028年2月ごろ）に必ず確かめ直す。
