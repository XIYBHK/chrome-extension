/* Chrome扩展智能暗色模式 - Content Script */
/* 简化版本 - 专注性能 */

// 全局变量
let isDarkModeEnabled = false;
let isNightEnhanced = false;
let hasExistingDarkMode = false;
let isFloatingBallEnabled = false;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let elementStartX = 0;
let elementStartY = 0;

// 常量定义
const DARK_MODE_ID = 'dark-mode-extension-styles';
const NOTIFICATION_ID = 'dark-mode-notification';
const FLOATING_BALL_ID = 'dark-mode-floating-ball';

// 主初始化函数
function initialize() {
    console.log('智能暗色模式扩展初始化');
    
    // 检测现有暗色模式
    detectExistingDarkMode();
    
    // 设置消息监听
    setupMessageListener();
    
    // 获取当前设置
    chrome.runtime.sendMessage({action: 'getSettings'}, (response) => {
        if (response && response.enabled && !hasExistingDarkMode) {
            enableDarkMode(response.nightEnhanced || false);
        }
        
        if (response && response.floatingBall) {
            isFloatingBallEnabled = true;
            createFloatingBall();
        }
    });
}

// 检测网站现有暗色模式
function detectExistingDarkMode() {
    const hostname = window.location.hostname;
    
    // 检测CSS暗色模式
    const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
    const rgb = parseRGBColor(bodyBgColor);
    
    if (rgb && (rgb.r + rgb.g + rgb.b) < 150) {
        hasExistingDarkMode = true;
        console.log('检测到网站现有暗色模式');
        return;
    }
    
    // 检测特定网站暗色模式
    hasExistingDarkMode = detectSpecificSiteDarkMode(hostname);
    
    if (hasExistingDarkMode) {
        console.log(`网站 ${hostname} 已有暗色模式`);
    }
}

// 检测特定网站暗色模式
function detectSpecificSiteDarkMode(hostname) {
    const darkModeSelectors = {
        'github.com': '[data-color-mode="dark"], [data-dark-theme]',
        'youtube.com': '[dark], [dark-theme]',
        'twitter.com': '[data-theme="dark"]',
        'reddit.com': '.theme-dark',
        'stackoverflow.com': '.theme-dark'
    };
    
    for (const domain in darkModeSelectors) {
        if (hostname.includes(domain)) {
            const darkElement = document.querySelector(darkModeSelectors[domain]);
            if (darkElement) {
                return true;
            }
        }
    }
    
    return false;
}

// 解析RGB颜色
function parseRGBColor(color) {
    if (!color) return null;
    
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    return null;
}

// 设置消息监听
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
            case 'enableDarkMode':
                if (!hasExistingDarkMode) {
                    enableDarkMode(request.nightEnhanced);
                }
                sendResponse({success: true});
                break;
                
            case 'disableDarkMode':
                disableDarkMode();
                sendResponse({success: true});
                break;
                
            case 'toggleFloatingBall':
                if (request.enabled) {
                    isFloatingBallEnabled = true;
                    createFloatingBall();
                } else {
                    isFloatingBallEnabled = false;
                    removeFloatingBall();
                }
                sendResponse({success: true});
                break;
                
            case 'checkStatus':
                sendResponse({
                    darkModeEnabled: isDarkModeEnabled,
                    nightEnhanced: isNightEnhanced,
                    hasExistingDarkMode: hasExistingDarkMode,
                    floatingBallEnabled: isFloatingBallEnabled
                });
                break;
        }
    });
}

// 启用暗色模式
function enableDarkMode(nightEnhanced = false) {
    if (hasExistingDarkMode) {
        console.log('网站已有暗色模式，跳过应用');
        return;
    }
    
    console.log('启用暗色模式，夜间增强:', nightEnhanced);
    
    isDarkModeEnabled = true;
    isNightEnhanced = nightEnhanced;
    
    // 移除现有样式
    removeDarkModeStyles();
    
    // 注入基础暗色样式
    injectDarkModeStyles();
    
    // 如果启用夜间增强，注入额外样式
    if (nightEnhanced) {
        injectNightEnhancedStyles();
    }
    
    showNotification('暗色模式已启用', nightEnhanced ? '夜间增强模式' : '标准暗色模式');
}

// 禁用暗色模式
function disableDarkMode() {
    console.log('禁用暗色模式');
    
    isDarkModeEnabled = false;
    isNightEnhanced = false;
    
    removeDarkModeStyles();
    
    showNotification('暗色模式已禁用', '已恢复原始颜色');
}

// 注入基础暗色模式样式
function injectDarkModeStyles() {
    const existingStyle = document.getElementById(DARK_MODE_ID);
    if (existingStyle) {
        existingStyle.remove();
    }

    const darkModeCSS = `
        /* 基础暗色模式样式 */
        
        /* 1. 基础重置 */
        html, body {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
        }
        
        /* 2. 主要容器 */
        main, article, section, aside, nav, header, footer,
        [role="main"], [role="article"], [role="navigation"], [role="banner"], [role="contentinfo"],
        .content, .main, .article, .section, .container, .wrapper, .panel, .card {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
            border-color: #333 !important;
        }
        
        /* 3. 文本元素 */
        div, span, p, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd,
        blockquote, pre, code, label, legend, figcaption {
            color: #e0e0e0 !important;
        }
        
        /* 4. 表单元素 */
        input, textarea, select, button {
            background-color: #333 !important;
            color: #e0e0e0 !important;
            border-color: #555 !important;
        }
        
        input[type="text"], input[type="email"], input[type="password"],
        input[type="search"], input[type="url"], textarea {
            background-color: #2a2a2a !important;
            color: #e0e0e0 !important;
        }
        
        /* 5. 链接 */
        a {
            color: #6db3f2 !important;
        }
        
        a:visited {
            color: #c996cc !important;
        }
        
        a:hover {
            color: #8cc8ff !important;
        }
        
        /* 6. 代码和预格式化文本 */
        code, pre, kbd, samp {
            background-color: #2a2a2a !important;
            color: #f0f0f0 !important;
            border-color: #444 !important;
        }
        
        /* 7. 表格 */
        table, th, td {
            background-color: #2a2a2a !important;
            color: #e0e0e0 !important;
            border-color: #444 !important;
        }
        
        thead, tbody, tfoot {
            background-color: #333 !important;
        }
        
        /* 8. 常见浅色背景类 */
        .white, .light, .bg-white, .bg-light {
            background-color: #2a2a2a !important;
            color: #e0e0e0 !important;
        }
        
        /* 9. 滚动条 */
        ::-webkit-scrollbar {
            background-color: #2a2a2a !important;
        }
        
        ::-webkit-scrollbar-thumb {
            background-color: #555 !important;
        }
        
        ::-webkit-scrollbar-track {
            background-color: #1a1a1a !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = DARK_MODE_ID;
    styleElement.textContent = darkModeCSS;
    document.head.appendChild(styleElement);
}

// 注入夜间增强样式
function injectNightEnhancedStyles() {
    const nightCSS = `
        /* 夜间增强模式 */
        
        /* 更深的背景色 */
        html, body {
            background-color: #0d1117 !important;
        }
        
        /* 降低图片亮度 */
        img:not([src*="avatar"]):not([src*="logo"]):not([src*="icon"]) {
            filter: brightness(0.8) !important;
        }
        
        /* 降低视频亮度 */
        video {
            filter: brightness(0.9) !important;
        }
        
        /* 更暗的容器 */
        main, article, section, .content, .container {
            background-color: #0d1117 !important;
        }
        
        /* 调整字体颜色降低对比度 */
        div, span, p, h1, h2, h3, h4, h5, h6 {
            color: #c9d1d9 !important;
        }
    `;

    const nightStyleElement = document.createElement('style');
    nightStyleElement.id = DARK_MODE_ID + '-night';
    nightStyleElement.textContent = nightCSS;
    document.head.appendChild(nightStyleElement);
}

// 移除暗色模式样式
function removeDarkModeStyles() {
    const styleElement = document.getElementById(DARK_MODE_ID);
    if (styleElement) {
        styleElement.remove();
    }
    
    const nightStyleElement = document.getElementById(DARK_MODE_ID + '-night');
    if (nightStyleElement) {
        nightStyleElement.remove();
    }
}

// 显示通知
function showNotification(title, message, type = 'success') {
    // 移除现有通知
    const existingNotification = document.getElementById(NOTIFICATION_ID);
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = NOTIFICATION_ID;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#1f2937' : '#dc2626'};
            color: #fff;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 300px;
            border-left: 4px solid ${type === 'success' ? '#10b981' : '#f87171'};
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        ">
            <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="opacity: 0.9;">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 自动消失
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// 创建悬浮球
function createFloatingBall() {
    if (!isFloatingBallEnabled) return;
    
    // 移除现有悬浮球
    removeFloatingBall();
    
    const floatingBall = createFloatingBallElement();
    document.body.appendChild(floatingBall);
    
    // 恢复位置
    restoreFloatingBallPosition();
}

// 创建悬浮球元素
function createFloatingBallElement() {
    const ball = document.createElement('div');
    ball.id = FLOATING_BALL_ID;
    ball.innerHTML = `
        <div style="
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            cursor: pointer;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            user-select: none;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 3a6 6 0 0 0 9 5.2A9 9 0 1 1 8.8 3 6 6 0 0 0 12 3Z"/>
            </svg>
        </div>
    `;
    
    // 添加事件监听
    const ballElement = ball.firstElementChild;
    ballElement.addEventListener('mousedown', dragStart);
    ballElement.addEventListener('click', handleFloatingBallClick);
    
    return ball;
}

// 拖拽开始
function dragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = e.target.getBoundingClientRect();
    elementStartX = rect.left;
    elementStartY = rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    e.target.style.transition = 'none';
}

// 拖拽中
function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    const newX = elementStartX + deltaX;
    const newY = elementStartY + deltaY;
    
    // 限制在视口内
    const maxX = window.innerWidth - 56;
    const maxY = window.innerHeight - 56;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));
    
    const ball = document.getElementById(FLOATING_BALL_ID);
    if (ball) {
        const ballElement = ball.firstElementChild;
        ballElement.style.left = clampedX + 'px';
        ballElement.style.top = clampedY + 'px';
        ballElement.style.right = 'auto';
        ballElement.style.bottom = 'auto';
    }
}

// 拖拽结束
function dragEnd(e) {
    if (!isDragging) return;
    
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    
    const ball = document.getElementById(FLOATING_BALL_ID);
    if (ball) {
        const ballElement = ball.firstElementChild;
        ballElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // 保存位置
        const rect = ballElement.getBoundingClientRect();
        chrome.runtime.sendMessage({
            action: 'saveFloatingBallPosition',
            position: { x: rect.left, y: rect.top }
        });
    }
}

// 处理悬浮球点击
function handleFloatingBallClick(e) {
    if (isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 切换暗色模式
    if (isDarkModeEnabled) {
        disableDarkMode();
        chrome.runtime.sendMessage({action: 'setDarkMode', enabled: false});
    } else {
        enableDarkMode();
        chrome.runtime.sendMessage({action: 'setDarkMode', enabled: true});
    }
}

// 恢复悬浮球位置
function restoreFloatingBallPosition() {
    chrome.runtime.sendMessage({action: 'getFloatingBallPosition'}, (response) => {
        if (response && response.position) {
            const ball = document.getElementById(FLOATING_BALL_ID);
            if (ball) {
                const ballElement = ball.firstElementChild;
                ballElement.style.left = response.position.x + 'px';
                ballElement.style.top = response.position.y + 'px';
                ballElement.style.right = 'auto';
                ballElement.style.bottom = 'auto';
            }
        }
    });
}

// 移除悬浮球
function removeFloatingBall() {
    const existingBall = document.getElementById(FLOATING_BALL_ID);
    if (existingBall) {
        existingBall.remove();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}