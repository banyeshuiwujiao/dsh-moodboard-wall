# dsh-moodboard-wall

DeepSeek Harness 右侧栏的**灵感墙 / 截图中转箱**：把截图和设计素材收集在一个网格里，随手整理成分组，需要时一键塞进当前会话的输入框。

图片只存在**你自己浏览器的 IndexedDB** 里，不落宿主磁盘、不进模型上下文、不产生任何宿主侧工具。宿主半侧（`index.js`）是空的，它存在的唯一意义是让这个 bundle 在插件清单里占一行，带上自己的标题、描述和图标。

## 它做什么

- **收集**：粘贴（Ctrl+V 或「粘贴」按钮走 Async Clipboard API）、拖放文件、`添加图片` 走文件选择器。
- **整理**：分组（chip 条，右键分组名即删除，组内图片回落到「未分类」）、每张图可改标题、可在预览里换组。
- **送出**：缩略图上的「发送到会话」把图作为草稿附件放进当前会话的输入框，和手动粘贴等价——你可以再编辑文字、再增删附件，然后自己按发送。
- **本地化**：中英双语，跟随 DSH 当前语言。

上限 300 张，超了会提示先删。

## 接线到运行时

在 profile 目录（桌面端是 `~/.dsh/profiles/desktop/`）的 `package.json` 里加两处：

```json
{
  "dependencies": {
    "dsh-moodboard-wall": "link:<绝对路径>/plugins/dsh-moodboard-wall"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-moodboard-wall"]
    }
  }
}
```

然后 `pnpm install` 让 link 生效，**重启客户端**。

> 只刷新页面不够：宿主在扫描时快照 `client.js`，combo 的 rev 会跟着 mtime/size 变，但响应体是缓存的，而 HMR 的 `/plugins/events` 只在宿主内网直连时才推。

## 实现要点

| 位置 | 作用 |
|---|---|
| `client.js` | 浏览器半侧。`window.__ModuleLoader__.load({ id, factory })` 注册一个工厂，工厂返回 `{ inject, apply }`。 |
| `cordis.patch.yml` | bundle 的 Cordis 补丁，往树里 `insert` 一行 `dsh-moodboard-wall`。 |
| `index.js` | 宿主半侧，空 `apply()`。 |
| `locale/{zh,en}.json` | 插件清单里的标题与描述（`LocalizedText`）。面板内文案在 `client.js` 的 `zh` / `en` 字典里，通过 `ctx.locale.register('moodboard', …)` 注册。 |

面板挂在右侧栏的 tab 体系上，走的是公开座位，不碰任何私有实现：

1. `ctx.sidebarRightTabs.register({ id, kind: 'moodboard', title, guide })` 声明一个**页面型** tab 类型（没有 `patterns`），并在引导页贡献一张卡片。
2. `ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name, key, locale, inject }, Body))` 注册主体；`sidebar.right.pane.tab.title` 注册 chip 标题。

主体组件拿到的是 `dsh-client-ui-session` 汇总的**标准 props**（`sessionId`、`inputActions`）加框架注入的 `useTabInfo` 和 `t`，而不是座位自己的注入参数。

「发送到会话」用的是 ui-conversation 的真实附件通道，没有猜方法名：

```js
const drafts = ctx.get('conversation').createDrafts(sessionId, files);
if (!inputActions.addAttachments(drafts.map((d) => d.id))) {
  ctx.get('conversation').releaseDraftAttachments(drafts);   // 输入框正在提交
}
```

## 已知边界

- **浏览器本地**：换设备、换浏览器、清站点数据都会丢；同一浏览器多窗口共享同一份库。
- **没有会话就没有落点**：右侧栏按会话 id 存布局，首页（hero）不渲染面板；发送时若没有挂载中的会话会直接提示。
- **附件不等于发送**：只把图放进草稿，不会替你提交。
- **SVG** 能存能看，但送进会话时按普通文件走上传通道，不走图片通道。

## 相关

- 座位与 tab 体系：`@deepseek-ai/dsh-client-ui-sidebar-right`
- 一个走同样路径的官方参考实现：`@deepseek-ai/dsh-client-ui-sidebar-documentpreview`

## License

MIT
