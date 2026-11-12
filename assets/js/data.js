// サイトの中身のデータ。ここを書き換えると、ページの該当する欄が変わります。
// 時刻はすべて日本時間。
// バスとTXの時刻は2026年11月に確かめた日曜・祝日のダイヤ。開催の2か月前（2028年1月中旬）に最新のダイヤへ更新する。
window.SITE = {
  updated: "2026-11-12",
  url: "https://shinfrog.github.io/mugenjuku-reunion-site/",
  event: { date: "2028-03-19", start: "09:50", end: "16:00" },

  // フォーム。url を入れておくと、受付期間（from〜to）のあいだ、ページのボタンが自動でそのフォームにつながります。
  forms: {
    ideas: { name: "「やってほしいこと」募集", url: "https://docs.google.com/forms/d/1eshTjy1dYRltrB22LF-FAKIfDrplhGG8FOQzufZtlfY/viewform", from: "2027-01-08", to: "2027-03-19" },
    rsvp: { name: "出欠の回答", url: "", from: "2027-10-01", to: "2028-02-18" }, // ④ 出欠フォーム（2027年10月ごろに作る）
    contact: { name: "お問い合わせ", url: "" } // 作ったら入れる（いまは第一報のメールへの返信で受けている）
  },

  // 時期ごとにトップの表示とボタンを変える
  phases: [
    { from: "2000-01-01", to: "2027-01-07", key: "soon", label: "準備中",
      lead: "2027年1月から「やってほしいこと」を募集します。",
      cta: { text: "「やってほしいこと」募集について", short: "やってほしいこと募集", href: "#ideas" },
      band: ["2028.3.19 SUN", "第5回 無絃塾同窓会", "筑波大学 未来社会デザイン棟・開学記念館", "2027年1月から「やってほしいこと」を募集"] },
    { from: "2027-01-08", to: "2027-03-19", key: "ideas", label: "募集中",
      lead: "同窓会で「やってほしいこと」を募集しています。締切は2027年3月19日（金）です。",
      cta: { text: "「やってほしいこと」を送る", short: "やってほしいことを送る", form: "ideas", fallback: "#schedule" },
      band: ["「やってほしいこと」募集中", "締切 2027.3.19（金）", "3分で答えられます", "2028.3.19 SUN 筑波大学"] },
    { from: "2027-03-20", to: "2027-09-30", key: "planning", label: "準備中",
      lead: "たくさんの声をありがとうございました。いただいた声をもとに、実行委員会で準備を進めています。",
      cta: { text: "これからの予定を見る", short: "これからの予定", href: "#schedule" },
      band: ["募集を締め切りました", "ありがとうございました", "2027年10月ごろ 正式なご案内", "2028.3.19 SUN"] },
    { from: "2027-10-01", to: "2028-02-18", key: "rsvp", label: "出欠受付中",
      lead: "出欠の受付を始めました。締切は2028年2月18日（金）です。",
      cta: { text: "出欠を回答する", short: "出欠を回答", form: "rsvp", fallback: "#about", fallbackText: "出欠の受付について" },
      band: ["出欠受付中", "締切 2028.2.18（金）", "同じ期の人にも回してください", "2028.3.19 SUN"] },
    { from: "2028-02-19", to: "2028-03-18", key: "final", label: "まもなく",
      lead: "まもなく当日です。行き方と持ち物をもう一度ご確認ください。",
      cta: { text: "行き方とバスの時刻", short: "行き方・バス", href: "#access" },
      band: ["まもなく当日", "受付 9:50 未来社会デザイン棟", "行き方とバスの時刻を確認", "上着を忘れずに"] },
    { from: "2028-03-19", to: "2028-03-19", key: "today", label: "本日開催",
      lead: "本日です。お気をつけてお越しください。",
      cta: { text: "地図アプリで会場を開く", short: "会場の地図", map: "a" },
      band: ["本日開催", "受付 9:50 未来社会デザイン棟", "13:15から開学記念館", "16:00 終了予定"] },
    { from: "2028-03-20", to: "2099-12-31", key: "after", label: "ありがとうございました",
      lead: "ご来場ありがとうございました。また弾きに来てください。",
      cta: { text: "これまでの同窓会を見る", short: "これまでの同窓会", href: "#history" },
      band: ["ご来場ありがとうございました", "また、みんなで弾こう。", "第5回 無絃塾同窓会"] }
  ],

  // お知らせ（新しい順。30日以内のものに NEW が付く）
  news: [
    { date: "2026-11-12", text: "同窓会のページを開きました（準備中の版です）。" }
  ],

  // 当日の流れ（venue: a=未来社会デザイン棟、move=移動、b=開学記念館、night=二次会）
  program: [
    { t: "09:50", venue: "a", title: "受付", text: "名札と選手名鑑をお渡しします。" },
    { t: "10:00", venue: "a", title: "開場・ウェルカムドリンク", text: "直近の卒公（2028年2月）の映像を流します。" },
    { t: "11:00", venue: "a", title: "式典", text: "記念品（名言カレンダー）、卒業する4年生をOBOGに迎える。" },
    { t: "12:10", venue: "a", title: "集合写真", text: "大階段でみんなで1枚。" },
    { t: "12:15", venue: "a", title: "昼食と映像", text: "昔の映像と有志の新作を上映、投票。" },
    { t: "13:00", venue: "move", title: "開学記念館へ移動", text: "歩いて6〜8分。実行委員がご案内します。" },
    { t: "13:15", venue: "b", title: "開門", text: "新二役の口上でお出迎え。" },
    { t: "13:20", venue: "b", title: "展示ツアー", text: "衣装・賞状・ビラ・展示パネル、先生方の部屋と売店。" },
    { t: "14:30", venue: "b", title: "記念演奏", text: "現役生、元頭の曲弾。最後に全員で津軽じょんがら節と踊り。", hi: true },
    { t: "16:00", venue: "b", title: "終了", text: "おつかれさまでした。" },
    { t: "17:30", venue: "night", title: "二次会", text: "場所と終わりの時刻は調整中です。決まりしだいお知らせします。" }
  ],

  places: {
    a: { name: "未来社会デザイン棟", q: "筑波大学 未来社会デザイン棟" },
    b: { name: "開学記念館", q: "筑波大学 開学記念館" },
    center: { name: "つくばセンター（バス乗り場）", q: "つくばセンター バスターミナル" },
    heisa: { name: "平砂学生宿舎前（行きのバス停・右回り）", q: "平砂学生宿舎前 バス停" },
    amakubo: { name: "天久保二丁目（行きのバス停・左回り）", q: "天久保二丁目 バス停 つくば" },
    nishi: { name: "筑波大学西（開学記念館の最寄り）", q: "筑波大学西 バス停" }
  },

  // Googleマップの徒歩ルート（Googleマップの「地図を埋め込む」で作ったURL。2026年11月）
  maps: [
    { tab: "2会場とバス停", cap: "未来社会デザイン棟 → 開学記念館（約450m、歩いて6〜8分）→ 筑波大学西（帰りのバス停）", src: "https://www.google.com/maps/embed?pb=!1m34!1m12!1m3!1d3223.6932388944197!2d140.09958017580666!3d36.100965222454704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m19!3e2!4m5!1s0x60220d0009324a79%3A0xf64b9b07d29e46a8!2z562R5rOi5aSn5a2m5pyq5p2l56S-5Lya44OH44K244Kk44Oz5qOf44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC5aSp5LmF5L-d77yS5LiB55uu!3m2!1d36.098530499999995!2d140.103363!4m5!1s0x60220bf62abb3a91%3A0x7c95ecb255e4b93d!2z6ZaL5a2m6KiY5b-16aSo44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC!3m2!1d36.1016458!2d140.1007237!4m5!1s0x60220c0819cd0b4d%3A0x81b2a11b0af9707e!2z562R5rOi5aSn5a2m6KW_44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC5aSp5LmF5L-d77yT5LiB55uu!3m2!1d36.1034!2d140.10155!5e0!3m2!1sja!2sjp!4v1794474934017!5m2!1sja!2sjp" },
    { tab: "行きのバス停から", cap: "平砂学生宿舎前（バス停）→ 未来社会デザイン棟：約290m、歩いて約5分", src: "https://www.google.com/maps/embed?pb=!1m24!1m8!1m3!1d3223.8099978384066!2d140.10009857580633!3d36.09811942245562!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x60220c0af4ad488f%3A0x88c007e1e93e1f3b!2z5bmz56CC5a2m55Sf5a6_6IiO5YmN44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC5aSp5LmF5L-d77yS5LiB55uu!3m2!1d36.097539999999995!2d140.10224!4m5!1s0x60220d0009324a79%3A0xf64b9b07d29e46a8!2z562R5rOi5aSn5a2m5pyq5p2l56S-5Lya44OH44K244Kk44Oz5qOf44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC5aSp5LmF5L-d77yS5LiB55uu!3m2!1d36.098530499999995!2d140.103363!5e0!3m2!1sja!2sjp!4v1794472280498!5m2!1sja!2sjp" },
    { tab: "帰りのバス停へ", cap: "開学記念館 → 筑波大学西（バス停）：約210m、歩いて3〜4分", src: "https://www.google.com/maps/embed?pb=!1m24!1m8!1m3!1d3223.631813965925!2d140.0986966758066!3d36.1024622724543!3m2!1i1024!2i768!4f13.1!4m13!3e2!4m5!1s0x60220bf62abb3a91%3A0x7c95ecb255e4b93d!2z6ZaL5a2m6KiY5b-16aSo44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC!3m2!1d36.1016458!2d140.1007237!4m5!1s0x60220c0819cd0b4d%3A0x81b2a11b0af9707e!2z562R5rOi5aSn5a2m6KW_44CB44CSMzA1LTAwMDUg6Iyo5Z-O55yM44Gk44GP44Gw5biC5aSp5LmF5L-d77yT5LiB55uu!3m2!1d36.1034!2d140.10155!5e0!3m2!1sja!2sjp!4v1794472304925!5m2!1sja!2sjp" }
  ],

  // バス・電車（日曜・祝日のダイヤ、2026年11月時点）
  transit: {
    checked: "2026年11月",
    next: "2028年1月中旬",
    sources: [
      { name: "関東鉄道バス 時刻表", url: "https://kantetsu.jorudan.biz/" },
      { name: "つくばエクスプレス 時刻表", url: "https://transfer-train.navitime.biz/tx/" }
    ],
    go: {
      title: "行き",
      intro: "つくば駅のA3出口を出て、つくばセンター6番のりばから「筑波大学循環」バスに乗ります（190円、交通系IC可）。",
      groups: [
        { name: "朝：つくばセンター 6番のりば 発（未来社会デザイン棟へ）", rows: [
          { dep: "8:20", line: "左回り", to: "天久保二丁目 8:26", note: "" },
          { dep: "8:40", line: "右回り", to: "平砂学生宿舎前 8:46", note: "" },
          { dep: "9:00", line: "左回り", to: "天久保二丁目 9:06", note: "おすすめ", mark: "best" },
          { dep: "9:20", line: "右回り", to: "平砂学生宿舎前 9:26", note: "間に合う最後", mark: "best" },
          { dep: "9:40", line: "左回り", to: "天久保二丁目 9:46", note: "受付に遅れます", mark: "late" }
        ]},
        { name: "つくばエクスプレス：つくば 着（秋葉原 発／北千住 発）", rows: [
          { dep: "8:48", line: "快速", to: "秋葉原 8:02／北千住 8:13", note: "9:00のバスへ" },
          { dep: "9:10", line: "区間快速", to: "秋葉原 8:17／北千住 8:28", note: "9:20のバスへ", mark: "best" },
          { dep: "9:19", line: "快速", to: "秋葉原 8:32／北千住 8:44", note: "バスに間に合わずタクシーへ", mark: "late" }
        ]},
        { name: "午後から来る方：つくばセンター 6番のりば 発（開学記念館へ）", rows: [
          { dep: "12:40", line: "右回り", to: "筑波大学西 12:47", note: "おすすめ", mark: "best" },
          { dep: "13:20", line: "右回り", to: "筑波大学西 13:27", note: "開門（13:15）に少し遅れます" }
        ]}
      ],
      tip: "つくばに9:10までに着く電車に乗ると安心です。バスを降りてから未来社会デザイン棟まで歩いて約5分、筑波大学西から開学記念館までは歩いて3〜4分です。"
    },
    move: {
      title: "移動（13:00）",
      intro: "未来社会デザイン棟から開学記念館までは約450m、歩いて6〜8分です。西へ出て、かえで通りを北へ。開学記念館は通りの左手（西側）です。",
      tip: "歩くのがつらい方は、事前に実行委員会へご相談ください。日曜のバスは本数が少ないので、歩くほうが早く着きます。"
    },
    back: {
      title: "帰り",
      intro: "開学記念館の最寄りは「筑波大学西」（歩いて3〜4分）。つくばセンター方面は左回りに乗ります（230円、約10分）。",
      groups: [
        { name: "バス：筑波大学西 発（左回り・つくばセンター方面）", rows: [
          { dep: "16:01", line: "左回り", to: "", note: "16:00の終了には間に合いません", mark: "late" },
          { dep: "16:41", line: "左回り", to: "", note: "終了後に乗りやすい便", mark: "best" },
          { dep: "17:21", line: "左回り", to: "", note: "" },
          { dep: "18:01", line: "左回り", to: "", note: "" },
          { dep: "18:41", line: "左回り", to: "", note: "" },
          { dep: "19:21", line: "左回り", to: "", note: "" },
          { dep: "20:01", line: "左回り", to: "", note: "" },
          { dep: "20:41", line: "左回り", to: "", note: "" },
          { dep: "21:21", line: "左回り", to: "", note: "" },
          { dep: "22:00", line: "左回り", to: "", note: "" },
          { dep: "22:40", line: "左回り", to: "つくばセンター 22:50", note: "最終", mark: "last" }
        ]},
        { name: "つくばエクスプレス：つくば 発（秋葉原方面）", rows: [
          { dep: "22:10", line: "快速", to: "秋葉原 22:55", note: "快速の最終" },
          { dep: "22:14", line: "区間快速", to: "秋葉原 23:07", note: "区間快速の最終" },
          { dep: "23:14", line: "普通", to: "秋葉原 0:12", note: "秋葉原まで行く最終", mark: "last" }
        ]},
      ],
      tip: "二次会の場所が決まったら、行き方と帰りの便をここに足します。"
    }
  },

  ways: [
    { icon: "🚃", title: "電車", text: "つくばエクスプレスで秋葉原から「つくば」まで快速で約47分（1,280円）。" },
    { icon: "🚌", title: "バス", text: "つくばセンター6番のりばから「筑波大学循環」。日曜は両方向あわせて20分おき。" },
    { icon: "🚕", title: "タクシー", text: "つくば駅A3・A4出口の乗り場から約10分、約1,200円（目安）。" },
    { icon: "🚗", title: "車", text: "入構の受付で臨時駐車証が必要です。二次会で飲む方は車で来ないでください。" }
  ],

  // つくば駅のまわりのホテル（料金と空室は各ホテルで確認してもらう）
  hotels: [
    { name: "ダイワロイネットホテルつくば", access: "つくば駅A5出口から歩いて約1分", note: "", url: "https://www.daiwaroynet.jp/tsukuba/" },
    { name: "ホテル日航つくば", access: "つくば駅A3出口から歩いて2分", note: "", url: "https://www.nikko-tsukuba.com/" },
    { name: "ホテルJALシティつくば", access: "つくば駅から歩いて8分", note: "つくば国際会議場に直結", url: "https://www.tsukuba.hoteljalcity.com/" }
  ],
  hotelsChecked: "2026年11月",

  // 無絃塾のYouTube。hero はトップで音なしで流す動画、picks は「いまの無絃塾を動画で」に並べる動画（古い順）
  youtube: {
    channel: "https://www.youtube.com/@%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E7%84%A1%E7%B5%83%E5%A1%BE/videos",
    hero: { id: "ZBcpuOby0Jc", title: "2026新歓PV" },
    picks: [
      { id: "qCIzh4u_p8s", title: "学園祭ダイジェスト④", date: "2026年2月公開" },
      { id: "ZBcpuOby0Jc", title: "2026新歓PV", date: "2026年4月公開" },
      { id: "SLACJcNoxSg", title: "無絃塾の稽古風景", date: "2026年4月公開" },
      { id: "0nGWPyitgMk", title: "無絃塾あるある！", date: "2026年5月公開" }
    ]
  },

  // 関連リンク（Instagramは2026年11月に公開のプロフィールを確認。YouTubeはそのプロフィールに載っているチャンネル）
  links: [
    { kind: "Instagram", title: "いまの無絃塾", sub: "筑波大学津軽三味線倶楽部無絃塾（@tsukuba_mugenjuku）", url: "https://www.instagram.com/tsukuba_mugenjuku/" },
    { kind: "YouTube", title: "無絃塾の動画", sub: "筑波大学津軽三味線倶楽部無絃塾のチャンネル", url: "https://www.youtube.com/@%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E7%84%A1%E7%B5%83%E5%A1%BE/videos" },
    { kind: "Webサイト", title: "喜楽座・喜幸会", sub: "無絃塾をご指導いただいている、民謡・津軽三味線の会", url: "https://www.kirakuza.net/kirakuzakikoukai" }
  ],

  // 期ごとの回答数（出欠の受付が始まったら入れる。例：{ ki: 15, yes: 4 }）
  generations: []
};
