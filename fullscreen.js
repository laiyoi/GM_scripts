// ==UserScript==
// @name         亿云校回放网页全屏
// @namespace    https://github.com/laiyoi/GM_scripts
// @license      MIT
// @version      1.0.0
// @author       laiyoi
// @description  类似 Bilibili 的网页全屏，视频垂直高度居中显示，自动裁剪左右宽度。完美兼容云校2x1920x1080的屏幕
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const interval = setInterval(() => {
        const controlBar = document.querySelector('.vjs-control-bar');
        const videoContainer = document.querySelector('.video-js');
        const video = videoContainer ? videoContainer.querySelector('video') : null;

        if (controlBar && videoContainer && video) {
            clearInterval(interval);

            // 创建网页全屏按钮
            const btn = document.createElement('button');
            btn.innerHTML = `
                <svg aria-hidden="true" height="16" width="16" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                    <rect x="2" y="2" width="20" height="20" fill="white" stroke="black" stroke-width="2"/>
                    <path d="M3 7V3h4" />
                    <path d="M17 3h4v4" />
                    <path d="M21 17v4h-4" />
                    <path d="M7 21H3v-4" />
                </svg>
                <span class="vjs-control-text" aria-live="polite">网页全屏</span>
            `;

            btn.className = 'vjs-control vjs-button vjs-webpage-fullscreen-button';
            btn.title = '网页全屏';
            btn.style.order = 999;

            GM_addStyle(`
                .webpage-fullscreen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999 !important;
                    background-color: black !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                }

                .webpage-fullscreen video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    object-position: center center !important;
                }
            `);

            let isFull = false;

            btn.onclick = () => {
                if (!isFull) {
                    videoContainer.classList.add('webpage-fullscreen');
                } else {
                    videoContainer.classList.remove('webpage-fullscreen');
                }
                isFull = !isFull;
            };

            controlBar.appendChild(btn);
        }
    }, 500);
})();
