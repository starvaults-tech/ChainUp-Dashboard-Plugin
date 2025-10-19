(()=>{
  const localStorageKey = "STAR_VAULTS_LOCAL_STORAGE_USER_LIST_KEY";
  // ---------- utils ----------
  function el (tag, props = {}, ...children) {
    const n = document.createElement(tag);
    Object.assign(n, props);
    for (const c of children) n.append(c?.nodeType ? c : document.createTextNode(c));
    return n;
  };
  function waitForElement(sel, cb, intv = 500, timeout = 1e4) {
    const start = Date.now();
    const t = setInterval(() => {
      const el = typeof sel === "function" ? sel() : document.querySelector(sel);
      if (el) return clearInterval(t), cb(el);
      if (timeout && Date.now() - start > timeout) clearInterval(t);
    }, intv);
    return t;
  }
  function replaceUserUidWithMail() {
    const csv = window.localStorage.getItem(localStorageKey);
    if (!csv) return console.warn("No CSV data found in localStorage.");
    const userData = csv.trim().split(/\r?\n/).map((line) => line.split(",").map((s) => s.trim()));
    const header = userData.shift();
    const uidIndex =
          header.indexOf("UID") >= 0 ? header.indexOf("UID") :
          header.indexOf("uid") >= 0 ? header.indexOf("uid") : -1;
      const mailIndex = ["邮箱", "郵箱", "MAIL", "mail"].map(k => header.indexOf(k)).find(i => i >= 0);
    if (uidIndex === -1 || mailIndex === undefined) return console.warn("UID 或 MAIL 欄位找不到。");
    const map = {};
    for (const row of userData) {
      const uid = row[uidIndex]?.trim();
      const mail = row[mailIndex]?.trim();
      if (uid && mail) map[uid] = mail;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      for (const [uid, mail] of Object.entries(map)) {
        if (node.textContent.includes(uid)) {
          node.textContent = node.textContent.replaceAll(uid, mail);
        }
      }
    }
    console.log("UID 已轉換為 mail。");
  }

  function createReplaceUserUtility(headerOptions) {
    // ---------- elements ----------
    const btn = el("button", {
      textContent: "使用者轉換",
      class: "header-replace-user",
      style: `
        position: fixed;
        right: 10px;
        top: 70px;
        padding: 8px 14px;
        border-radius: 10px;
        background: rgb(10, 100, 180);
        color: white;
        border: none;
        cursor: pointer;
      `,
    });

    const textarea = el("textarea", {
      style: `
        width: 600px;
        height: 300px;
        font-family: monospace;
        display: block;
      `,
      placeholder: "請貼上 CSV 內容...",
      value: window.localStorage.getItem(localStorageKey)
    });

    const closeBtn = el("button", {
      textContent: "關閉",
      style: `
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        margin-left: 10px;
        border: none;
        background: rgb(200, 30, 60);
        color: white;
      `,
    });

    const replaceBtn = el("button", {
      textContent: "轉換",
      style: `
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        margin-left: 10px;
        border: none;
        background: rgb(10, 100, 180);
        color: white;
      `,
    });

    const btnContainer = el("div", {
      style: `
        text-align: right;
        padding-top: 10px;
      `,
    }, closeBtn, replaceBtn);

    const container = el(
      "div",
      {
        style: `
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          padding: 10px;
          border: 1px solid #aaa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 10000;
        `,
      },
      textarea,
      btnContainer
    );
    headerOptions.append(btn);
    document.body.append(container);

    // ---------- events ----------
    btn.onclick = () => {
      container.style.display = "block";
      textarea.focus();
    };

    closeBtn.onclick = () => {
      container.style.display = "none";
    };

    replaceBtn.onclick = () => {
      container.style.display = "none";
      replaceUserUidWithMail();
    };

    textarea.oninput = (e) => {
      window.localStorage.setItem(localStorageKey, textarea.value);
    }
    textarea.onchange = (e) => {
      window.localStorage.setItem(localStorageKey, textarea.value);
    }


  }

  waitForElement("div.header-options", createReplaceUserUtility);
})();