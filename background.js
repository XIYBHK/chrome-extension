/* Chrome扩展智能暗色模式 - 后台脚本 */
/* 简化版本 - 专注稳定性 */

// 默认设置
const DEFAULT_SETTINGS = {
    enabled: false,
    nightEnhanced: false,
    autoMode: false,
    floatingBall: true,
    schedule: {
        enabled: false,
        startTime: '18:00',
        endTime: '06:00'
    },
    statistics: {
        totalUsageTime: 0,
        sitesProcessed: 0,
        lastUsed: null
    },
    location: null,
    floatingBallPosition: { x: 30, y: 100 }
};

// 检查API可用性
function isAPIAvailable(api) {
    try {
        return api && typeof api === 'object';
    } catch (error) {
        return false;
    }
}

// 安全的API调用
function safeAPICall(apiCall, fallback = null) {
    try {
        return apiCall();
    } catch (error) {
        console.log('API调用失败:', error.message);
        return fallback;
    }
}

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('智能暗色模式扩展已安装');
    
    // 初始化设置
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
        console.log('默认设置已保存');
    });
    
    // 更新徽章
    updateBadge(false);
});

// 处理来自内容脚本和弹窗的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    switch (request.action) {
        case 'getSettings':
            chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
                sendResponse(settings);
            });
            return true;
            
        case 'setDarkMode':
            setDarkMode(request.enabled, request.nightEnhanced);
            sendResponse({ success: true });
            break;
            
        case 'toggleDarkMode':
            toggleDarkMode();
            sendResponse({ success: true });
            break;
            
        case 'setFloatingBall':
            setFloatingBall(request.enabled);
            sendResponse({ success: true });
            break;
            
        case 'saveSettings':
            chrome.storage.sync.set(request.settings, () => {
                console.log('设置已保存:', request.settings);
                sendResponse({ success: true });
            });
            return true;
            
        case 'getStatistics':
            getStatistics((stats) => {
                sendResponse(stats);
            });
            return true;
            
        case 'resetStatistics':
            resetStatistics(() => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'saveFloatingBallPosition':
            chrome.storage.sync.set({ 
                floatingBallPosition: request.position 
            }, () => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'getFloatingBallPosition':
            chrome.storage.sync.get(['floatingBallPosition'], (result) => {
                sendResponse({ 
                    position: result.floatingBallPosition || DEFAULT_SETTINGS.floatingBallPosition 
                });
            });
            return true;
            
        case 'logActivity':
            logActivity(request.activity);
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ success: false, message: '未知操作' });
    }
});

// 设置暗色模式
function setDarkMode(enabled, nightEnhanced = false) {
    const settings = { enabled, nightEnhanced };
    
    chrome.storage.sync.set(settings, () => {
        console.log('暗色模式设置:', settings);
        
        // 更新徽章
        updateBadge(enabled);
        
        // 应用到所有标签页
        applyToAllTabs(enabled, nightEnhanced);
        
        // 记录统计
        if (enabled) {
            logActivity({ type: 'darkModeEnabled', nightEnhanced });
        } else {
            logActivity({ type: 'darkModeDisabled' });
        }
    });
}

// 切换暗色模式
function toggleDarkMode() {
    chrome.storage.sync.get(['enabled', 'nightEnhanced'], (result) => {
        const newEnabled = !result.enabled;
        setDarkMode(newEnabled, result.nightEnhanced);
    });
}

// 设置悬浮球
function setFloatingBall(enabled) {
    chrome.storage.sync.set({ floatingBall: enabled }, () => {
        console.log('悬浮球设置:', enabled);
        
        // 应用到所有标签页
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url && !tab.url.startsWith('chrome://')) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleFloatingBall',
                        enabled: enabled
                    }).catch(() => {});
                }
            });
        });
    });
}

// 应用到所有标签页
function applyToAllTabs(enabled, nightEnhanced) {
    if (!isAPIAvailable(chrome.tabs)) {
        console.log('Tabs API不可用');
        return;
    }
    
    safeAPICall(() => {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (tab.url && !tab.url.startsWith('chrome://')) {
                    const action = enabled ? 'enableDarkMode' : 'disableDarkMode';
                    chrome.tabs.sendMessage(tab.id, {
                        action: action,
                        nightEnhanced: nightEnhanced
                    }).catch(() => {
                        // 忽略发送失败的标签页
                    });
                }
            });
        });
    });
}

// 更新徽章
function updateBadge(enabled) {
    if (!isAPIAvailable(chrome.action)) {
        console.log('Action API不可用');
        return;
    }
    
    safeAPICall(() => {
        chrome.action.setBadgeText({
            text: enabled ? 'ON' : ''
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: enabled ? '#4CAF50' : '#757575'
        });
    });
}

// 获取统计信息
function getStatistics(callback) {
    chrome.storage.sync.get(['statistics'], (result) => {
        const stats = result.statistics || DEFAULT_SETTINGS.statistics;
        callback(stats);
    });
}

// 重置统计信息
function resetStatistics(callback) {
    chrome.storage.sync.set({ 
        statistics: DEFAULT_SETTINGS.statistics 
    }, callback);
}

// 记录活动
function logActivity(activity) {
    chrome.storage.sync.get(['statistics'], (result) => {
        const stats = result.statistics || DEFAULT_SETTINGS.statistics;
        
        // 更新统计
        if (activity.type === 'darkModeEnabled') {
            stats.sitesProcessed = (stats.sitesProcessed || 0) + 1;
            stats.lastUsed = new Date().toISOString();
        }
        
        // 保存统计
        chrome.storage.sync.set({ statistics: stats });
    });
}

// 标签页更新监听
if (isAPIAvailable(chrome.tabs)) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
            // 检查是否应该自动应用暗色模式
            chrome.storage.sync.get(['enabled', 'nightEnhanced'], (result) => {
                if (result.enabled) {
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tabId, {
                            action: 'enableDarkMode',
                            nightEnhanced: result.nightEnhanced
                        }).catch(() => {});
                    }, 500);
                }
            });
        }
    });
}

console.log('智能暗色模式后台脚本已加载');