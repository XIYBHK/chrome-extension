# 🌙 智能暗色模式 Chrome 扩展

一个智能的Chrome浏览器扩展，为网页提供高质量的暗色模式体验，专注于性能优化和用户体验。

## ✨ 主要功能

### 🎯 核心功能
- **智能暗色模式**：基于高效CSS规则的通用暗色化方案
- **夜间增强模式**：更深度的夜间阅读体验，保护眼睛
- **悬浮球控制**：可拖拽的页面快捷切换工具
- **智能检测**：自动跳过已有暗色模式的网站
- **现代化UI**：毛玻璃效果的弹窗界面

### 📊 附加功能
- **使用统计**：记录处理网站数量和使用时长
- **位置记忆**：悬浮球位置自动保存
- **状态同步**：多标签页状态实时同步
- **一键重置**：快速重置所有设置和统计

## 🚀 安装说明

### 开发模式安装
1. 下载或克隆本项目到本地
2. 打开Chrome浏览器，进入扩展程序页面 (`chrome://extensions/`)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹

### 应用商店安装
*即将发布到Chrome Web Store*

## 🛠️ 技术特性

### 性能优化
- ✅ **零智能检测**：移除所有可能导致性能问题的实时检测
- ✅ **CSS优先**：基于高效CSS规则，避免JavaScript密集计算
- ✅ **选择性应用**：智能跳过已有暗色模式的网站
- ✅ **内存友好**：最小化DOM操作和事件监听

### 兼容性保证
- ✅ **Manifest V3**：使用最新的Chrome扩展标准
- ✅ **跨域安全**：严格遵循内容安全策略
- ✅ **API保护**：所有Chrome API调用都有异常处理
- ✅ **降级机制**：API不可用时的备用方案

### 用户体验
- ✅ **即时响应**：扩展状态变化立即生效
- ✅ **视觉反馈**：优雅的通知和状态指示
- ✅ **直观操作**：简洁明了的界面设计
- ✅ **键盘友好**：支持键盘导航和操作

## 📁 项目结构

```
chrome-extension/
├── manifest.json       # 扩展配置文件 (Manifest V3)
├── background.js       # 后台服务脚本
├── content.js          # 内容脚本 (简化性能版)
├── popup.html          # 弹窗界面
├── popup.js           # 弹窗交互逻辑
├── dark-theme.css     # 基础暗色样式
├── icons/             # 扩展图标
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # 项目说明
```

## 🔧 开发指南

### 本地开发
1. 克隆仓库：`git clone https://github.com/XIYBHK/chrome-extension.git`
2. 在Chrome中加载扩展进行测试
3. 修改代码后重新加载扩展查看效果

### 调试技巧
- 使用Chrome开发者工具调试
- 查看扩展程序页面的错误信息
- 利用console.log输出调试信息
- 使用Chrome扩展开发工具

### 代码规范
- 遵循ES6+语法标准
- 使用有意义的变量和函数命名
- 添加必要的注释说明
- 保持代码简洁和可维护性

## 🐛 问题修复

### 性能问题解决
本项目之前遇到过智能检测系统导致的性能问题，现已完全解决：

**问题**：智能检测系统过于激进，导致网页无限加载和无响应
**解决**：
- 移除MutationObserver DOM监听器
- 禁用实时元素修正系统
- 简化CSS规则，避免全局性能影响
- 移除所有可能导致无限循环的代码

### Service Worker错误修复
**问题**：chrome.alarms API导致的"Cannot read properties of undefined"错误
**解决**：
- 完全移除chrome.alarms依赖
- 使用JavaScript原生定时器替代
- 添加API可用性检查
- 实现安全的API调用机制

## 📈 版本历史

### v1.3.0 (当前版本)
- ✅ 完全重构性能优化
- ✅ 移除所有智能检测功能
- ✅ 添加悬浮球控制
- ✅ 优化用户界面
- ✅ 修复Service Worker错误

### v1.2.0
- 智能特征检测系统
- 18层分层CSS架构
- 实时智能修正系统
- *(因性能问题已移除)*

### v1.1.0
- 基础暗色模式功能
- 夜间增强模式
- 弹窗界面设计

### v1.0.0
- 项目初始版本
- 基本功能实现

## 🤝 贡献指南

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**XIYBHK** - [GitHub](https://github.com/XIYBHK)

## 🙏 致谢

- 感谢所有为此项目做出贡献的开发者
- 感谢Chrome扩展开发社区的支持
- 感谢所有用户的反馈和建议

## 📮 联系方式

- GitHub: [@XIYBHK](https://github.com/XIYBHK)
- Issues: [提交问题](https://github.com/XIYBHK/chrome-extension/issues)

---

**注意**：这是一个持续开发的项目，功能和文档会不断更新。如果您遇到任何问题，请及时反馈。