# TMC Transcript Crawler

一个用于在网页端会议纪要/转写页面中，自动滚动抓取全部发言内容的小工具。

当前版本已经增强了对“发言人名称为空或结构不一致”场景的兼容能力，适合处理部分页面中说话人节点结构不稳定的问题。

## 功能特性

- **自动滚动抓取**：持续向下滚动直到页面末尾
- **基于 `pid` 去重**：避免重复记录同一段内容
- **增强发言人识别**：优先读取 `span` 中的名字，失败时回退到整个名字容器文本
- **滚动容器兜底**：主容器未命中时，尝试从行节点父元素中推断滚动容器
- **空内容过滤**：自动跳过空白占位内容
- **换行清洗**：将正文中的换行替换为空格，减少输出噪声
- **剪贴板复制**：优先自动复制，失败时可手动复制控制台输出
- **零依赖**：直接在浏览器控制台运行即可

## 文件结构

```text
.
├── LICENSE
├── README.md
└── script.js
```

## 使用方式

### 1. 打开目标页面

进入包含会议转写内容的网页，并确保页面中存在或近似存在以下 DOM 结构：

- 滚动容器：`.minutes-module-list`
- 每一行内容：`.minutes-module-row`
- 段落 id：`.paragraph-module_paragraph__79pMd`
- 发言人容器：`.paragraph-module_speaker-name-edit__7T-ht`
- 开始时间：`.minutes-module-p-start-time`
- 发言内容：`.minutes-module-sentences`

> 如果页面类名改版，需要同步修改 `script.js` 中的选择器。

### 2. 打开浏览器开发者工具

- macOS: `Option + Command + I`
- Windows: `F12` 或 `Ctrl + Shift + I`

切换到 **Console** 面板。

### 3. 粘贴并运行脚本

将 `script.js` 的完整内容粘贴到控制台并执行。

### 4. 等待抓取完成

脚本会自动：

- 查找滚动容器
- 边滚动边采集转写内容
- 去重并清洗文本
- 输出完整内容到控制台
- 尝试复制结果到剪贴板

## 输出格式

```text
[00:01] 张三: 大家下午好，我们开始今天的会议
[00:08] 李四: 好的，我先同步一下当前进度
[00:20] 未知: 这里是因为页面里发言人节点缺失
```

## 这次升级了什么

### 1. 修复发言人可能为空的问题

旧版主要依赖：

```js
row.querySelector('.paragraph-module_speaker-name__afSbd')?.innerText
```

这在某些页面里可能拿不到名字。

新版改成：

```js
let nameElement = row.querySelector('.paragraph-module_speaker-name-edit__7T-ht')
let name = '未知'
if (nameElement) {
  name = nameElement.querySelector('span')?.innerText || nameElement.innerText
  name = name.trim()
}
```

这样可以兼容：

- 名字在内部 `span` 中的情况
- 没有 `span`，但外层容器有文本的情况
- 发言人确实为空时回退为 `未知`

### 2. 增加滚动容器兜底逻辑

如果 `.minutes-module-list` 没找到，会尝试：

```js
document.querySelector('.minutes-module-row')?.parentElement
```

适合部分页面滚动区域挂在外层父节点的情况。

### 3. 降低漏抓概率

相较旧版：

- 滚动跨度从 `600` 调整到 `500`
- 等待时间从 `200ms` 提高到 `300ms`

这样更稳，能减少因为页面异步渲染导致的漏抓。

### 4. 清洗正文文本

新版会将内容中的换行替换为空格：

```js
content.replace(/\n/g, ' ')
```

并过滤空白内容，减少控制台输出噪声。

## 原理说明

脚本核心流程如下：

1. 优先查找主滚动容器 `.minutes-module-list`
2. 如果没找到，则尝试从 `.minutes-module-row` 的父节点推断容器
3. 遍历当前 DOM 中所有 `.minutes-module-row`
4. 提取 `pid`、发言人、时间、正文
5. 用 `Map` 以 `pid` 做唯一键去重
6. 向下滚动并等待页面渲染
7. 滚动不再变化时结束抓取
8. 拼接结果并输出到控制台/剪贴板

## 注意事项

- 本脚本强依赖目标页面 DOM 结构，页面改版后可能失效
- 运行时尽量保持目标标签页处于激活状态
- 某些浏览器会限制控制台脚本访问剪贴板
- 如果自动复制失败，可直接从控制台手动复制
- 如果页面使用虚拟列表且回收过快，仍可能需要继续调节滚动步长与等待时间

## 适用场景

- 会议纪要页面内容导出
- 网页转写结果抓取
- 手动复制低效时的临时提取
- 需要快速粘贴到文档、Obsidian 或 IM 工具时

## 后续可继续增强

- 支持导出为 `.txt`
- 支持导出为 `.json`
- 支持自定义选择器配置
- 支持抓取进度显示
- 支持更稳的自动重试策略
- 支持封装为 Tampermonkey 脚本

## 免责声明

请仅在你有权限访问和处理相关页面数据的前提下使用本项目。

如涉及会议内容、个人信息或企业内部数据，请遵守相应的隐私、合规与安全要求。

## License

MIT
