// ==UserScript==
// @name         检测关键词并跳转到自定义网址
// @license      MIT
// @namespace    https://github.com/laiyoi/GM_scripts
// @version      1.0
// @description  检测特定关键词并跳转到指定网址
// @author       Laiyoi
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11.4.0/dist/sweetalert2.all.min.js
// ==/UserScript==

(function () {
    "use strict";
  
    // 获取存储的设置
    let keywordUrlMapping = GM_getValue("keywordUrlMapping", {});
    let quickUrls = GM_getValue("quickUrls", {});
    let isInSettingPage = false; // 设置标志，检查是否在设置页面
  
    // 显示设置框
    function showSettingBox() {
      isInSettingPage = true; // 设置为在设置页面
  
      let html = `
        <div style="font-size: 1em;">
          <h3>设置关键词和跳转网址</h3>
          <div>
            <label>关键词：</label>
            <input type="text" id="key" placeholder="输入关键词" />
          </div>
          <div>
            <label>跳转网址：</label>
            <select id="urlSelect">
              <option value="">选择预设</option>
              ${Object.entries(quickUrls).map(([name, url]) => `<option value="${url}">${name}aa</option>`).join('')}
            </select>
            <input type="text" id="value" placeholder="输入跳转网址" />
          </div>
          <button id="addEntry">添加跳转</button>
          <button id="closeSettings">关闭</button>
          <div>
            <h4>当前设置</h4>
            <ul id="dictionaryList"></ul>
          </div>
          <div>
            <h4>预设</h4>
            <input type="text" id="quickOptionName" placeholder="预设名称" />
            <input type="text" id="quickOptionUrl" placeholder="预设网址" />
            <button id="addQuickOption">添加预设</button>
            <ul id="quickOptionList"></ul>
          </div>
        </div>
      `;
  
      Swal.fire({
        title: '关键词和网址设置',
        html,
        icon: 'info',
        showCloseButton: true,
        confirmButtonText: '保存',
        footer: '<div style="text-align: center;font-size: 1em;">助手免费开源，Powered by <a href="https://www.example.com">example</a></div>',
        customClass: 'panai-setting-box'
      }).then((res) => {
        if (res.isConfirmed) {
          // 保存设置
          GM_setValue("keywordUrlMapping", keywordUrlMapping);
          GM_setValue("quickUrls", quickUrls);
          history.go(0); // 刷新页面
        }
      });
  
      const keyInput = document.getElementById("key");
      const valueInput = document.getElementById("value");
      const urlSelect = document.getElementById("urlSelect");
      const dictionaryList = document.getElementById("dictionaryList");
      const addButton = document.getElementById("addEntry");
      const closeButton = document.getElementById("closeSettings");
  
      const quickOptionNameInput = document.getElementById("quickOptionName");
      const quickOptionUrlInput = document.getElementById("quickOptionUrl");
      const addQuickOptionButton = document.getElementById("addQuickOption");
      const quickOptionList = document.getElementById("quickOptionList");
  
      // 更新显示的字典列表
      function updateDictionaryList() {
        dictionaryList.innerHTML = "";
        for (const [key, value] of Object.entries(keywordUrlMapping)) {
          const listItem = document.createElement("li");
          listItem.textContent = `${key} → ${value}`;
  
          // 创建删除按钮
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "删除";
          deleteButton.style.marginLeft = "10px";
          deleteButton.addEventListener("click", () => {
            delete keywordUrlMapping[key];
            updateDictionaryList(); // 更新显示的字典列表
          });
  
          listItem.appendChild(deleteButton);
          dictionaryList.appendChild(listItem);
        }
      }
  
      // 添加跳转项
      addButton.addEventListener("click", () => {
        const key = keyInput.value.trim();
        const value = valueInput.value.trim() || urlSelect.value;
  
        if (key && value) {
          keywordUrlMapping[key] = value;
          keyInput.value = "";
          valueInput.value = "";
          urlSelect.value = "";
          updateDictionaryList();
        }
      });
  
      // 添加预设
      addQuickOptionButton.addEventListener("click", () => {
        const name = quickOptionNameInput.value.trim();
        const url = quickOptionUrlInput.value.trim();
  
        if (name && url) {
          quickUrls[name] = url;
          quickOptionNameInput.value = "";
          quickOptionUrlInput.value = "";
          updateQuickOptionList();
          updateDropdown();
        }
      });
  
      // 更新预设列表
      function updateQuickOptionList() {
        quickOptionList.innerHTML = "";
        for (const [name, url] of Object.entries(quickUrls)) {
          const listItem = document.createElement("li");
          listItem.textContent = `${name} ： ${url}`;
  
          // 创建删除按钮
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "删除";
          deleteButton.style.marginLeft = "10px";
          deleteButton.addEventListener("click", () => {
            delete quickUrls[name];
            updateQuickOptionList(); // 更新显示的预设列表
            updateDropdown();
          });
  
          listItem.appendChild(deleteButton);
          quickOptionList.appendChild(listItem);
        }
      }
  
      // 更新下拉框
      function updateDropdown() {
        urlSelect.innerHTML = `<option value="">选择预设</option>`;
        for (const [name, url] of Object.entries(quickUrls)) {
          const option = document.createElement("option");
          option.value = url;
          option.textContent = `${name} - ${url}`;
          urlSelect.appendChild(option);
        }
      }
  
      // 关闭设置页面
      closeButton.addEventListener("click", () => {
        isInSettingPage = false; // 设置为不在设置页面
        Swal.close();
      });
  
      // 初始化页面显示字典和预设
      updateDictionaryList();
      updateQuickOptionList();
      updateDropdown();
    }
  
    // 检测页面中的关键词并跳转
    function detectAndRedirect() {
      if (isInSettingPage) return; // 如果在设置页面，跳过检测
  
      const bodyText = document.body.innerText;
  
      for (let [keyword, url] of Object.entries(keywordUrlMapping)) {
        if (bodyText.includes(keyword)) {
          // 如果匹配到关键词，跳转到指定的URL
          window.location.href = url;
          break;
        }
      }
    }
  
    // 监视DOM加载并执行检测
    async function afterDomLoaded(root) {
      if (!root) return;
  
      // 执行检测函数
      detectAndRedirect();
  
      // 检查所有的 shadow DOM
      root.querySelectorAll("*").forEach(async (node) => {
        if (node.shadowRoot) {
          await afterDomLoaded(node.shadowRoot);
        }
      });
    }
  
    // 等待文档加载完成
    async function init() {
      while (document.readyState == "loading") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
  
      // 初始执行
      afterDomLoaded(document);
  
      // 定时检查页面内容
      setInterval(() => afterDomLoaded(document), 2500);
    }
  
    // 启动脚本
    init();
  
    // 注册菜单命令，触发设置页面
    GM_registerMenuCommand('⚙️ 设置', () => {
      showSettingBox();
    });
  
  })();
