/* Chrome扩展智能暗色模式 - 弹窗脚本 */
/* 简化版本 - 专注稳定性 */

// DOM元素
let elements = {};

// 当前设置
let currentSettings = {
    enabled: false,
    nightEnhanced: false,
    floatingBall: true
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('弹窗初始化');
    
    // 获取DOM元素
    initializeElements();
    
    // 加载当前设置
    loadSettings();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载统计信息
    loadStatistics();
});

// 初始化DOM元素
function initializeElements() {
    elements = {
        darkModeSwitch: document.getElementById('darkModeSwitch'),
        nightEnhanced: document.getElementById('nightEnhanced'),
        floatingBallSwitch: document.getElementById('floatingBallSwitch'),
        sitesCount: document.getElementById('sitesCount'),
        usageTime: document.getElementById('usageTime'),
        resetStats: document.getElementById('resetStats'),
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText')
    };
}

// 加载设置
function loadSettings() {
    chrome.runtime.sendMessage({action: 'getSettings'}, (response) => {
        if (response) {
            currentSettings = response;
            updateUI();
            updateStatus();
        }
    });
}

// 更新UI
function updateUI() {
    // 更新主开关
    if (elements.darkModeSwitch) {
        elements.darkModeSwitch.classList.toggle('active', currentSettings.enabled);
    }
    
    // 更新夜间增强
    if (elements.nightEnhanced) {
        elements.nightEnhanced.checked = currentSettings.nightEnhanced;
        elements.nightEnhanced.disabled = !currentSettings.enabled;
    }
    
    // 更新悬浮球开关
    if (elements.floatingBallSwitch) {
        elements.floatingBallSwitch.classList.toggle('active', currentSettings.floatingBall);
    }
}

// 更新状态
function updateStatus() {
    if (elements.statusDot && elements.statusText) {
        if (currentSettings.enabled) {
            elements.statusDot.className = 'status-dot active';
            elements.statusText.textContent = currentSettings.nightEnhanced ? '夜间增强模式' : '暗色模式已启用';
        } else {
            elements.statusDot.className = 'status-dot inactive';
            elements.statusText.textContent = '暗色模式已关闭';
        }
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 主开关
    if (elements.darkModeSwitch) {
        elements.darkModeSwitch.addEventListener('click', function() {
            currentSettings.enabled = !currentSettings.enabled;
            if (!currentSettings.enabled) {
                currentSettings.nightEnhanced = false;
            }
            saveSettings();
        });
    }
    
    // 夜间增强
    if (elements.nightEnhanced) {
        elements.nightEnhanced.addEventListener('change', function() {
            if (currentSettings.enabled) {
                currentSettings.nightEnhanced = this.checked;
                saveSettings();
            }
        });
    }
    
    // 悬浮球开关
    if (elements.floatingBallSwitch) {
        elements.floatingBallSwitch.addEventListener('click', function() {
            currentSettings.floatingBall = !currentSettings.floatingBall;
            saveSettings();
            
            // 立即应用悬浮球设置
            chrome.runtime.sendMessage({
                action: 'setFloatingBall',
                enabled: currentSettings.floatingBall
            });
        });
    }
    
    // 重置统计按钮
    if (elements.resetStats) {
        elements.resetStats.addEventListener('click', function() {
            if (confirm('确定要重置所有统计数据吗？')) {
                resetStatistics();
            }
        });
    }
}

// 保存设置
function saveSettings() {
    // 本地更新UI
    updateUI();
    updateStatus();
    
    // 保存到存储
    chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: currentSettings
    }, (response) => {
        if (response && response.success) {
            console.log('设置已保存');
            
            // 应用暗色模式设置
            if (currentSettings.enabled) {
                chrome.runtime.sendMessage({
                    action: 'setDarkMode',
                    enabled: true,
                    nightEnhanced: currentSettings.nightEnhanced
                });
            } else {
                chrome.runtime.sendMessage({
                    action: 'setDarkMode',
                    enabled: false
                });
            }
        }
    });
}

// 加载统计信息
function loadStatistics() {
    chrome.runtime.sendMessage({action: 'getStatistics'}, (response) => {
        if (response) {
            updateStatisticsUI(response);
        }
    });
}

// 更新统计信息UI
function updateStatisticsUI(stats) {
    if (elements.sitesCount) {
        elements.sitesCount.textContent = stats.sitesProcessed || 0;
    }
    
    if (elements.usageTime) {
        const minutes = Math.floor((stats.totalUsageTime || 0) / 60000);
        elements.usageTime.textContent = minutes + '分钟';
    }
}

// 重置统计
function resetStatistics() {
    chrome.runtime.sendMessage({action: 'resetStatistics'}, (response) => {
        if (response && response.success) {
            updateStatisticsUI({
                sitesProcessed: 0,
                totalUsageTime: 0
            });
            
            // 显示成功提示
            if (elements.statusText) {
                const originalText = elements.statusText.textContent;
                elements.statusText.textContent = '统计已重置';
                setTimeout(() => {
                    elements.statusText.textContent = originalText;
                }, 2000);
            }
        }
    });
}

// 错误处理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 处理来自后台脚本的消息
    if (request.action === 'settingsUpdated') {
        loadSettings();
    }
});

// 窗口关闭时清理
window.addEventListener('beforeunload', function() {
    console.log('弹窗关闭');
});