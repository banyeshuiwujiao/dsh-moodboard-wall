# dsh-moodboard-wall

DeepSeek Harness 右侧栏的**灵感墙 / 截图中转箱**：把截图、图片和文本碎片摊在一张自由画布上，随手拖动、缩放、叠次序，需要时一键塞进当前会话的输入框。

图片只存在**你自己浏览器的 IndexedDB** 里，不落宿主磁盘、不进模型上下文、不产生任何宿主侧工具。宿主半侧（`index.js`）是空的，它存在的唯一意义是让这个 bundle 在插件清单里占一行，带上自己的标题、描述和图标。

## 它做什么

- **收集**：Ctrl+V 粘贴截图或图片（也识别剪贴板里的纯文本，直接变成文本块）、拖放文件、`添加图片` 走文件选择器、`加文本` 新建文本块。
- **自由摆放**：画布上的每个块都是独立浮块——按住拖动改位置，右下角手柄改大小。图片锁定宽高比等比缩放，文本块自由宽高。
- **层级**：新块默认在最上层；hover 出来的置顶按钮、右键菜单的置顶/置底随时调整叠放次序。
- **编辑**：文本块双击即改，回车区外或失焦保存；图片块双击开大图预览，可改标题、换分组。
- **分组**：分组 chip 条，右键分组名即删除，组内素材回落到「未分类」。分组只做筛选，不改变块在画布上的绝对坐标。
- **送出**：缩略图上的「发送到会话」把图作为草稿附件放进当前会话的输入框，和手动粘贴等价——你可以再编辑文字、再增删附件，然后自己按发送。
- **本地化**：中英双语，跟随 DSH 当前语言。

画布背景可在网格/纯色之间切换；`整理` 把当前分组的块按加入顺序码成流式布局；`导出全部` 导出所有图片和一份带时间戳的文本汇总。

上限 300 个块，超了会提示先删。

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

### 数据与持久化

每个块在 IndexedDB 的 `items` 表里是一条记录，`x/y/width/height/zIndex` 就是画布坐标：

```js
{ id, type: 'image' | 'text', board, title, content, width, height, x, y, zIndex, createTime }
```

图片块额外带一个 `blob` 字段——二进制直接落在 IndexedDB 里，`blob:` URL 只在会话内有效，刷新后由 `loadWall()` 重新 `createObjectURL`。文本块没有 blob，`content` 就是正文。

拖拽/缩放/改文本/增删都会走 `scheduleSave()`：**800ms 防抖**后把内存里的几何写回 IndexedDB（保留原 blob，只覆盖元数据字段）。插件卸载时强制 flush 一次，所以收起侧边栏、切 tab、重启客户端都不会丢布局。

> 早期版本把图片的 base64 塞进同一条记录，超过几十张就把 IndexedDB 读写拖到卡顿；现在二进制与元数据分开存，`getAll()` 只读一次。

### 拖拽与缩放

没有引 interact.js——它不在浏览器模块表里，塞进来要么走 CDN（违反「不加载外部脚本」），要么打包一份（插件目录只发单文件）。所以 `Block` 组件自己实现了手势：`mousedown` 记录原点，`mousemove` 用 `requestAnimationFrame` 节流地往 store 里写，`mouseup` 收尾。图片走等比（锁定按下时的宽高比），文本自由。最小尺寸 80px（图）/ 120×60（文本）。

### 剪贴板

两条路都走通：

- **窗口内 Ctrl+V**：根节点监听 React 的 `onPaste`，从 `clipboardData.items` 里挑 `image/*` 的 File；没有图片则取 `text/plain`，非空就建一个文本块。
- **「粘贴」按钮**：走 Async Clipboard API `navigator.clipboard.read()`。这条路会被浏览器的安全策略拦（非用户手势、或页面没聚焦），拦住了就提示「先点这里，再按 Ctrl+V」并让根节点拿焦点。

粘贴位置取**鼠标所在的画布坐标**（换算时把滚动偏移一起算上），连击多张会阶梯式错开 16px，不会全叠在一起。

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
- **横向不滚动**：画布只垂直滚动，块的 x 上限就是侧边栏宽度；想横向摊开就把侧边栏拖宽或开全屏。
- **复制图片回剪贴板**依赖 `ClipboardItem`，老浏览器或不支持的上下文会退化成「直接下载该图」并在通知里说明。

## 相关

- 座位与 tab 体系：`@deepseek-ai/dsh-client-ui-sidebar-right`
- 一个走同样路径的官方参考实现：`@deepseek-ai/dsh-client-ui-sidebar-documentpreview`

## License

MIT
