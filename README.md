# dsh-moodboard-wall

DeepSeek Harness 右侧栏的**灵感墙 / 截图中转箱**：把截图、图片和文本碎片摊在一张自由画布上，随手拖动、缩放、叠次序，需要时一键塞进当前会话的输入框。

图片只存在**你自己浏览器的 IndexedDB** 里，不落宿主磁盘、不进模型上下文、不产生任何宿主侧工具。宿主半侧（`index.js`）是空的，它存在的唯一意义是让这个 bundle 在插件清单里占一行，带上自己的标题、描述和图标。

## 它做什么

- **收集**：Ctrl+V 粘贴截图或图片（也识别剪贴板里的纯文本，直接变成文本块）、拖放文件、`添加图片` 走文件选择器、`加文本` 新建文本块。
- **自由摆放**：画布上的每个块都是独立浮块——按住拖动改位置，右下角手柄改大小。图片锁定宽高比等比缩放，文本块自由宽高。
- **层级**：新块默认在最上层；hover 出来的置顶按钮、右键菜单的置顶/置底随时调整叠放次序。
- **编辑**：
  - **文本块**：双击即改，回车区外或失焦保存。
  - **图片块**：双击开大图预览，可改标题、换分组；悬停卡片右上角 `编辑图片` 按钮（或右键菜单/大图预览工具栏）即可打开**全功能图片编辑器**：
    - **10 大标记工具**：矩形、椭圆、箭头、自由画笔、半透明荧光笔（划线透出文字）、步骤序号徽标（① ② ③ 自动递增计数）、实心隐私脱敏涂黑（物理遮盖 Key/密码）、马赛克局部打码、局部 2x 放大镜（突出细节）、文字标注；支持选择颜色、粗细、撤销与清空；
    - **自由裁剪（Crop）**：在画面上拖选任意矩形选区，支持实时尺寸标注与一键应用裁剪，坐标系与标记自动平移，支持撤销；
    - **画面与增强调整（Adjust）**：支持顺时针/逆时针 90° 旋转、水平与垂直翻转、高对比度 OCR 文本增强滤镜、底色反转（深浅底互转）、一键恢复原图；
    - **尺寸调整（Resize）**：任意指定宽度和高度，支持比例锁定开关与一键恢复原始尺寸；
    - **格式与压缩（Format）**：支持在 PNG、JPEG、WebP 之间转换并调节有损压缩质量（JPEG 自动垫白底防透明黑边），实时预估并展示输出体积；
    - **全流程撤销与原地覆写**：支持图元、裁剪、旋转与滤镜的统一历史撤销；保存后画布图片无缝就地更新，标题与后缀智能同步。
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

### 图像编辑引擎

基于 `dsh-plugin-live-shot` 的原生 Canvas 引擎迁移与深度扩展：

- **操作重放**：以「原图位图 + 矢量操作列表」作为基础数据模型，所有画笔、矩形、椭圆、箭头、荧光笔、序号徽标、脱敏遮罩、马赛克、放大镜、文字等图元均存储于图片天然像素坐标系（而非屏幕 CSS 像素），因此在画布或窗口缩放时标注位置永远精确锚定。
- **自由裁剪与图元平移**：裁剪选区应用后，自动截取底图并按选区偏移量同步平移已有标注坐标，超出边界的单点标注自动安全过滤。
- **几何变换与滤镜增强**：支持无损 90° 旋转、水平与垂直翻转，已画图元矩阵坐标同步旋转；内置高对比度自适应二值化增强（专为暗色终端与代码截图 OCR 优化）与深浅底反色滤镜。
- **多格式导出与平铺保护**：支持 `image/png`、`image/jpeg`、`image/webp` 编码；针对透明通道转 JPEG 可能产生全黑底的问题，导出前自动通过内存离屏 Canvas 平铺纯白底色（`#fff`）保障观感。
- **状态同步与去重**：保存时原地更新对应卡片的内存 Blob、对象 URL、卡片尺寸比例与持久化 IndexedDB，并自动剥除和替换原有文件名的重复后缀（如避免产生 `.png.jpg`）。
- **统一撤销栈**：统一调度图元撤销与底图变换（裁剪/旋转/滤镜）快照回退，误操作可随时撤回。

「发送到会话」用的是 ui-conversation 的真实附件通道，没有猜方法名：

```js
const drafts = ctx.get('conversation').createDrafts(sessionId, files, true);
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
