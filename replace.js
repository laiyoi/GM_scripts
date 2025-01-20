// ==UserScript==
// @name         替换文本
// @license      MIT
// @namespace    https://github.com/laiyoi/GM_scripts
// @version      1.0
// @description  可影响输入框中的内容，支持自定义设置
// @author       Laiyoi
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11.4.0/dist/sweetalert2.all.min.js
// ==/UserScript==

// 默认字典，如果没有保存过，则使用这个
let dictionary = GM_getValue("dictionary", {});

// 是否影响输入框
const affectInput = GM_getValue('setting_affect_input', true);

// 统计字典替换成功的次数
let settingSuccessTimes = GM_getValue('setting_success_times', 0);

// 显示设置框
function showSettingBox() {
  let html = `
    <div style="font-size: 1em;">
      <label class="panai-setting-label">
        影响输入框的替换
        <input type="checkbox" id="S-Affect-Input" ${affectInput ? 'checked' : ''} class="panai-setting-checkbox">
      </label>
      <h3>自定义替换词典</h3>
      <div>
        <label>关键词：</label>
        <input type="text" id="key" placeholder="输入关键词" />
      </div>
      <div>
        <label>替换文本：</label>
        <input type="text" id="value" placeholder="输入替换文本" />
      </div>
      <button id="addEntry">添加替换</button>
      <button id="closeSettings">关闭</button>
      <div>
        <h4>当前替换项</h4>
        <ul id="dictionaryList"></ul>
      </div>
    </div>
  `;

  Swal.fire({
    title: '字典替换配置',
    html,
    icon: 'info',
    showCloseButton: true,
    confirmButtonText: '保存',
    footer: '<div style="text-align: center;font-size: 1em;">助手免费开源，Powered by <a href="https://www.example.com">example</a></div>',
    customClass: 'panai-setting-box'
  }).then((res) => {
    if (res.isConfirmed) {
      // 保存字典设置     
      res.isConfirmed && history.go(0);
      GM_setValue('setting_affect_input', document.getElementById('S-Affect-Input').checked);
      GM_setValue("dictionary", dictionary);
    }
  });

  const keyInput = document.getElementById("key");
  const valueInput = document.getElementById("value");
  const dictionaryList = document.getElementById("dictionaryList");
  const addButton = document.getElementById("addEntry");
  const closeButton = document.getElementById("closeSettings");
  const affectInputCheckbox = document.getElementById("S-Affect-Input");

  // 更新显示的字典列表
  function updateDictionaryList() {
    dictionaryList.innerHTML = "";
    for (const [key, value] of Object.entries(dictionary)) {
      const listItem = document.createElement("li");
      listItem.textContent = `${key} → ${value}`;
      
      // 创建删除按钮
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "删除";
      deleteButton.style.marginLeft = "10px";
      deleteButton.addEventListener("click", () => {
        delete dictionary[key];
        updateDictionaryList(); // 更新显示的字典列表
      });
      
      listItem.appendChild(deleteButton);
      dictionaryList.appendChild(listItem);
    }
  }

  // 添加替换项
  addButton.addEventListener("click", () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (key && value) {
      dictionary[key] = value;
      keyInput.value = "";
      valueInput.value = "";
      updateDictionaryList();
    }
  });

  // 关闭设置页面
  closeButton.addEventListener("click", () => {
    Swal.close();
  });

  // 初始化页面显示字典
  updateDictionaryList();
  affectInputCheckbox.checked = GM_getValue('setting_affect_input', true);
}

// 替换页面中的文本
function replacer(str) {
  for (const [key, value] of Object.entries(dictionary)) {
    const regex = new RegExp(key, 'g');
    str = str.replace(regex, value);
  }
  return str;
}

// 替换页面中的文本内容
function replace(root) {
  requestIdleCallback(() => {
    root.querySelectorAll(
      ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'article', 'section', 'blockquote', 'li', 'a']
        .concat(affectInput ? ['input'] : [])
        .join(',')
    ).forEach((candidate) => {
      if (!candidate.closest('.panai-setting-box')) { // 排除设置页面的内容
        if (candidate.nodeName === "INPUT" && affectInput) {
          candidate.value = replacer(candidate.value);
        } else if (candidate.textContent && candidate.textContent === candidate.innerHTML.trim()) {
          candidate.textContent = replacer(candidate.textContent);
        } else if (Array.from(candidate.childNodes).filter(c => c.nodeName === "BR")) {
          Array.from(candidate.childNodes).forEach((maybeText) => {
            if (maybeText.nodeType === Node.TEXT_NODE) {
              maybeText.textContent = replacer(maybeText.textContent);
            }
          });
        }
      }
    });
  });
}

/**
 * @param {Element} root
 */
async function afterDomLoaded(root) {
  if (!root) return;

  const fn = () => {
    replace(root);
    root.querySelectorAll("*").forEach(async (node) => {
      if (node.shadowRoot) {
        await afterDomLoaded(node.shadowRoot);
      }
    });
  };

  while (document.readyState === "loading") {
    await new Promise((r) => setTimeout(r, 1000));
  }
  fn();
}

// 初始执行
afterDomLoaded(document);
setInterval(() => afterDomLoaded(document), 2500);

// 注册菜单命令
GM_registerMenuCommand('⚙️ 设置', () => {
  showSettingBox();
});
