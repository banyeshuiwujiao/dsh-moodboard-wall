window.__ModuleLoader__.load({
  id: 'dsh-moodboard-wall',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useRef, useState, useSyncExternalStore } = React;

    /** This package's copy namespace. */
    const NS = 'moodboard';
    /** The tab kind this package owns. */
    const KIND = 'moodboard';
    /** This implementation's identity in the tab system, and the key its body registers under. */
    const PLUGIN_ID = 'dsh-moodboard-wall';

    /** Browser-local storage for the wall's records. */
    const DB_NAME = 'dsh-moodboard-wall';
    const DB_VERSION = 1;
    const STORE = 'items';
    /** Browser-local storage for the board list. */
    const BOARDS_KEY = 'dsh.moodboard.boards.v1';
    /** Browser-local storage for the canvas preferences. */
    const LAYOUT_KEY = 'dsh.moodboard.layout.v1';
    /** The pseudo board that shows every item. */
    const ALL = 'all';
    /** The pseudo board that shows items without a board. */
    const INBOX = 'inbox';
    /** A wall this size stays comfortably inside a browser tab's memory. */
    const MAX_ITEMS = 300;
    /** Longest edge kept when a pasted image is normalized. */
    const MAX_EDGE = 1920;
    /** Longest edge a freshly pasted image opens at, so a 4K screenshot does not swamp the canvas. */
    const FIT_EDGE = 320;
    /** Smallest rendered image block. */
    const MIN_IMAGE = 80;
    /** Smallest text block. */
    const MIN_TEXT_W = 120;
    const MIN_TEXT_H = 60;
    /** A new text block starts at this size. */
    const DEFAULT_TEXT_W = 200;
    const DEFAULT_TEXT_H = 132;
    /** Largest block allowed on the canvas. */
    const MAX_BLOCK = 2400;
    /** Geometry is only persisted after this much quiet time. */
    const SAVE_DEBOUNCE_MS = 800;

    /** Simplified Chinese dictionary. */
    const zh = {
      'type.label': '灵感墙',
      'guide.title': '灵感墙',
      'guide.description': '收集截图与设计素材，随时送进会话',
      'header.count': '{count} 张',
      'action.add': '添加图片',
      'action.paste': '粘贴',
      'action.text': '加文本',
      'action.move': '移动',
      'action.download': '下载',
      'action.delete': '删除',
      'action.send': '发送到会话',
      'action.clear': '清空',
      'action.close': '关闭',
      'action.newBoard': '新建分组',
      'action.preview': '预览',
      'action.removeBoard': '删除分组',
      'action.copyImage': '复制图片',
      'action.copyText': '复制文本',
      'action.editImage': '编辑图片',
      'edit.title': '图片编辑',
      'edit.tab.annotate': '标记',
      'edit.tab.resize': '尺寸',
      'edit.tab.format': '格式',
      'edit.tool.rect': '矩形',
      'edit.tool.ellipse': '椭圆',
      'edit.tool.arrow': '箭头',
      'edit.tool.pen': '画笔',
      'edit.tool.mosaic': '马赛克',
      'edit.tool.text': '文字',
      'edit.color': '颜色',
      'edit.weight': '粗细',
      'edit.undo': '撤销',
      'edit.clearMarks': '清空标记',
      'edit.width': '宽',
      'edit.height': '高',
      'edit.lockAspect': '锁定比例',
      'edit.original': '原始尺寸',
      'edit.format': '输出格式',
      'edit.quality': '质量',
      'edit.textPlaceholder': '输入文字后回车',
      'edit.save': '保存到画布',
      'edit.cancel': '取消',
      'edit.result': '{width} × {height} · {type} · {size}',
      'notice.edited': '已更新图片。',
      'error.edit': '编辑失败：{message}',
      'action.saveImage': '另存为',
      'action.bringFront': '置顶',
      'action.sendBack': '置底',
      'action.arrange': '整理',
      'action.exportAll': '导出全部',
      'action.confirmClear': '确认清空',
      'action.grid': '网格背景',
      'action.solid': '纯色背景',
      'board.all': '全部',
      'board.inbox': '未分类',
      'board.untitled': '未命名分组',
      'field.title': '标题',
      'field.note': '备注',
      'empty.title': '灵感墙还是空的',
      'empty.body': '把截图粘贴或拖进来，点「添加图片」也可以从文件里选。',
      'empty.hint': '先点这里，再按 Ctrl+V 粘贴截图。',
      'loading': '正在读取本地素材…',
      'error.storage': '本地存储不可用：{message}',
      'error.send': '无法直接附加到会话：{message}',
      'error.noSession': '当前没有打开的会话。',
      'error.noIntake': '当前界面没有可接收附件的输入框，请打开一个会话再试。',
      'error.noImages': '选中的图片已不在本地存储里，请重新添加。',
      'error.locked': '输入框正在提交，稍后再试一次。',
      'error.noImage': '这张图已不在本地存储里，请重新添加。',
      'notice.sent': '已把 {count} 张图片放进输入框。',
      'notice.sentOne': '已把图片放进输入框。',
      'notice.deleted': '已从灵感墙移除。',
      'notice.cleared': '已清空当前分组。',
      'notice.boardCreated': '已新建分组「{name}」。',
      'notice.boardRemoved': '已删除分组，里面的图片移到了「未分类」。',
      'notice.renamed': '已重命名。',
      'notice.copied': '已复制图片到剪贴板。',
      'notice.textCopied': '已复制文本。',
      'notice.textSaved': '文本已保存。',
      'notice.exported': '已导出 {count} 个文件。',
      'notice.arranged': '已按当前顺序整理。',
      'notice.limit': '灵感墙最多保留 {limit} 张图片，请先删除一些。',
      'notice.exportEmpty': '当前分组没有可导出的内容。',
      'text.placeholder': '在这里输入文本…',
      'canvas.label': '灵感墙画布'
    };
    /** English dictionary, checked against the Chinese key set. */
    const en = {
      'type.label': 'Moodboard',
      'guide.title': 'Moodboard',
      'guide.description': 'Collect screenshots and design material, and send them into the chat',
      'header.count': '{count}',
      'action.add': 'Add images',
      'action.paste': 'Paste',
      'action.text': 'Add text',
      'action.move': 'Move',
      'action.download': 'Download',
      'action.delete': 'Delete',
      'action.send': 'Send to chat',
      'action.clear': 'Clear',
      'action.close': 'Close',
      'action.newBoard': 'New board',
      'action.preview': 'Preview',
      'action.removeBoard': 'Remove board',
      'action.copyImage': 'Copy image',
      'action.copyText': 'Copy text',
      'action.editImage': 'Edit image',
      'edit.title': 'Edit image',
      'edit.tab.annotate': 'Mark up',
      'edit.tab.resize': 'Resize',
      'edit.tab.format': 'Format',
      'edit.tool.rect': 'Rectangle',
      'edit.tool.ellipse': 'Ellipse',
      'edit.tool.arrow': 'Arrow',
      'edit.tool.pen': 'Pen',
      'edit.tool.mosaic': 'Mosaic',
      'edit.tool.text': 'Text',
      'edit.color': 'Color',
      'edit.weight': 'Thickness',
      'edit.undo': 'Undo',
      'edit.clearMarks': 'Clear marks',
      'edit.width': 'Width',
      'edit.height': 'Height',
      'edit.lockAspect': 'Lock aspect ratio',
      'edit.original': 'Original size',
      'edit.format': 'Output format',
      'edit.quality': 'Quality',
      'edit.textPlaceholder': 'Type and press Enter',
      'edit.save': 'Save to wall',
      'edit.cancel': 'Cancel',
      'edit.result': '{width} × {height} · {type} · {size}',
      'notice.edited': 'Image updated.',
      'error.edit': 'Editing failed: {message}',
      'action.saveImage': 'Save as',
      'action.bringFront': 'Bring to front',
      'action.sendBack': 'Send to back',
      'action.arrange': 'Arrange',
      'action.exportAll': 'Export all',
      'action.confirmClear': 'Confirm clear',
      'action.grid': 'Grid background',
      'action.solid': 'Solid background',
      'board.all': 'All',
      'board.inbox': 'Unfiled',
      'board.untitled': 'Untitled board',
      'field.title': 'Title',
      'field.note': 'Note',
      'empty.title': 'The wall is empty',
      'empty.body': 'Paste or drop screenshots here, or use "Add images" to pick files.',
      'empty.hint': 'Click here first, then press Ctrl+V to paste a screenshot.',
      'loading': 'Reading local material…',
      'error.storage': 'Local storage is unavailable: {message}',
      'error.send': 'Could not attach to the conversation: {message}',
      'error.noSession': 'There is no open conversation.',
      'error.noIntake': 'There is no composer here that accepts attachments; open a conversation first.',
      'error.noImages': 'The selected images are no longer in local storage; add them again.',
      'error.locked': 'The composer is submitting; try again in a moment.',
      'error.noImage': 'This image is no longer in local storage; add it again.',
      'notice.sent': 'Added {count} images to the composer.',
      'notice.sentOne': 'Added the image to the composer.',
      'notice.deleted': 'Removed from the wall.',
      'notice.cleared': 'Cleared this board.',
      'notice.boardCreated': 'Created the board "{name}".',
      'notice.boardRemoved': 'Removed the board; its images are now unfiled.',
      'notice.renamed': 'Renamed.',
      'notice.copied': 'Copied the image to the clipboard.',
      'notice.textCopied': 'Copied the text.',
      'notice.textSaved': 'Text saved.',
      'notice.exported': 'Exported {count} files.',
      'notice.arranged': 'Arranged in the current order.',
      'notice.limit': 'The wall keeps at most {limit} images; remove some first.',
      'notice.exportEmpty': 'Nothing in this board can be exported.',
      'text.placeholder': 'Type text here…',
      'canvas.label': 'Moodboard canvas'
    };

    /** The style block this package owns, installed once per page. */
    const STYLE_ID = 'dsh-moodboard-wall/moodboard.css';
    const CSS = [
      '.mbw-root{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:1.5;background:var(--dsw-specific-sidebar-fill,transparent);outline:none}',
      '.mbw-header{display:flex;align-items:center;gap:6px;flex:none;flex-wrap:wrap;padding:8px 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}',
      '.mbw-title{font-weight:600;font-size:13px;white-space:nowrap}',
      '.mbw-count{color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}',
      '.mbw-spacer{flex:1 1 auto;min-width:0}',
      '.mbw-btn{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}',
      '.mbw-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-btn:disabled{opacity:.45;cursor:default}',
      '.mbw-btn[data-variant="primary"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.mbw-btn[data-variant="primary"]:hover:not(:disabled){background:var(--dsw-alias-brand-primary);color:#fff}',
      '.mbw-btn[data-variant="danger"]{color:var(--dsw-alias-state-error-primary)}',
      '.mbw-btn[data-variant="danger"][data-armed="true"]{background:var(--dsw-alias-state-error-primary);border-color:transparent;color:#fff}',
      '.mbw-btn[data-active="true"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-btn svg{width:13px;height:13px;flex:none}',
      '.mbw-boards{display:flex;align-items:center;gap:6px;flex:none;padding:8px 12px;overflow-x:auto;border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.mbw-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis}',
      '.mbw-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-chip[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.mbw-chipInput{height:24px;width:110px;padding:0 8px;border-radius:999px;border:.5px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}',
      '.mbw-notice{margin:0;padding:6px 12px;flex:none;font-size:11px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.mbw-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}',
      '.mbw-notice[data-tone="success"]{color:var(--dsw-alias-state-success-primary)}',
      '.mbw-canvas{flex:1 1 auto;min-height:0;position:relative;overflow:auto;overscroll-behavior:contain}',
      '.mbw-canvas[data-dragging="true"]{outline:1px dashed var(--dsw-alias-brand-primary);outline-offset:-6px}',
      '.mbw-canvas[data-background="grid"]{background-image:linear-gradient(to right,var(--dsw-alias-border-l1) 1px,transparent 1px),linear-gradient(to bottom,var(--dsw-alias-border-l1) 1px,transparent 1px);background-size:var(--mbw-grid-size,24px) var(--mbw-grid-size,24px);background-position:-1px -1px}',
      '.mbw-canvas[data-background="solid"]{background-color:var(--dsw-alias-bg-layer-1)}',
      '.mbw-stage{position:relative;width:100%;min-width:100%;min-height:100%;box-sizing:border-box}',
      '.mbw-block{position:absolute;box-sizing:border-box;border-radius:var(--dsw-radius-md,8px);border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);overflow:hidden;touch-action:none}',
      '.mbw-block:hover{border-color:var(--dsw-alias-border-l2)}',
      '.mbw-block[data-selected="true"]{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary)}',
      '.mbw-block[data-dragging="true"]{opacity:.85}',
      '.mbw-blockImage{display:block;width:100%;height:100%;object-fit:cover;background:var(--dsw-alias-bg-layer-2);pointer-events:none;-webkit-user-drag:none}',
      '.mbw-blockText{width:100%;height:100%;margin:0;padding:8px 10px;box-sizing:border-box;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1.5;resize:none;overflow:auto;white-space:pre-wrap;word-break:break-word;outline:none}',
      '.mbw-blockTitle{position:absolute;left:0;right:0;bottom:0;padding:10px 6px 4px;font-size:11px;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,0));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;text-align:left}',
      '.mbw-blockBar{position:absolute;top:4px;right:4px;display:flex;gap:2px;opacity:0;transition:opacity .12s ease}',
      '.mbw-block:hover .mbw-blockBar,.mbw-block:focus-within .mbw-blockBar,.mbw-block[data-selected="true"] .mbw-blockBar{opacity:1}',
      '.mbw-blockBtn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:rgba(0,0,0,.55);color:#fff;cursor:pointer}',
      '.mbw-blockBtn:hover{background:rgba(0,0,0,.75)}',
      '.mbw-blockBtn[data-action="move"]{cursor:grab}',
      '.mbw-blockBtn[data-action="move"]:active{cursor:grabbing}',
      '.mbw-blockBtn svg{width:13px;height:13px}',
      '.mbw-handle{position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;touch-action:none}',
      '.mbw-handle:after{content:"";position:absolute;right:3px;bottom:3px;width:7px;height:7px;border-right:2px solid var(--dsw-alias-brand-primary);border-bottom:2px solid var(--dsw-alias-brand-primary);border-bottom-right-radius:2px}',
      '.mbw-menu{position:fixed;z-index:60;min-width:132px;padding:4px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2);box-shadow:0 8px 24px rgba(0,0,0,.24)}',
      '.mbw-menuItem{display:flex;align-items:center;gap:8px;width:100%;height:28px;padding:0 8px;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-align:left;cursor:pointer}',
      '.mbw-menuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.mbw-menuItem[data-variant="danger"]{color:var(--dsw-alias-state-error-primary)}',
      '.mbw-menuItem svg{width:13px;height:13px;flex:none}',
      '.mbw-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:180px;height:100%;text-align:center;color:var(--dsw-alias-label-secondary);padding:0 18px}',
      '.mbw-emptyTitle{color:var(--dsw-alias-label-primary);font-size:13px}',
      '.mbw-emptyBody{font-size:12px;max-width:280px}',
      '.mbw-emptyHint{font-size:11px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.mbw-lightbox{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62)}',
      '.mbw-lightboxPanel{position:relative;display:flex;flex-direction:column;gap:10px;max-width:min(760px,92vw);max-height:92vh;padding:12px;border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2)}',
      '.mbw-lightboxImage{max-width:100%;max-height:64vh;object-fit:contain;border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-layer-1)}',
      '.mbw-lightboxRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
      '.mbw-field{display:flex;flex-direction:column;gap:3px;min-width:140px;flex:1}',
      '.mbw-fieldLabel{font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.mbw-input{height:28px;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}',
      '.mbw-input:focus{border-color:var(--dsw-alias-brand-primary)}',
      '.mbw-select{height:28px;padding:0 6px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}',
      '.mbw-close{position:absolute;top:8px;right:8px;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.mbw-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-close svg{width:14px;height:14px}',
      '.mbw-editor{position:fixed;inset:0;z-index:80;display:flex;flex-direction:column;background:rgba(0,0,0,.72);font-family:system-ui}',
      '.mbw-editorBar{display:flex;align-items:center;gap:6px;flex:none;flex-wrap:wrap;padding:8px 12px;background:var(--dsw-alias-bg-overlay);border-bottom:.5px solid var(--dsw-alias-border-l2)}',
      '.mbw-editorTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);white-space:nowrap}',
      '.mbw-editorSpacer{flex:1 1 auto;min-width:0}',
      '.mbw-editorTabs{display:flex;gap:2px;flex:none;padding:6px 12px 0;background:var(--dsw-alias-bg-layer-1)}',
      '.mbw-editorTab{height:26px;padding:0 12px;border:0;border-radius:var(--dsw-radius-sm,6px) var(--dsw-radius-sm,6px) 0 0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}',
      '.mbw-editorTab:hover{color:var(--dsw-alias-label-primary)}',
      '.mbw-editorTab[data-active="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.mbw-editorStage{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;padding:14px;overflow:auto}',
      '.mbw-editorCanvas{display:block;max-width:min(1100px,92vw);max-height:60vh;background:#fff;cursor:crosshair;touch-action:none;box-shadow:0 8px 32px rgba(0,0,0,.5)}',
      '.mbw-editorTools{display:flex;align-items:center;gap:4px}',
      '.mbw-editorTool{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.mbw-editorTool:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-editorTool[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.mbw-editorTool svg{width:15px;height:15px}',
      '.mbw-editorColor{width:28px;height:28px;padding:2px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,6px);background:transparent;cursor:pointer}',
      '.mbw-editorRange{width:78px;accent-color:var(--dsw-alias-brand-primary)}',
      '.mbw-editorPanel{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex:none;padding:10px 12px;background:var(--dsw-alias-bg-layer-1);border-top:.5px solid var(--dsw-alias-border-l1)}',
      '.mbw-editorField{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.mbw-editorNum{width:84px;height:26px;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}',
      '.mbw-editorNum:focus{border-color:var(--dsw-alias-brand-primary)}',
      '.mbw-editorMeta{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.mbw-editorTextBox{position:fixed;z-index:90;padding:4px 6px;font:13px system-ui;color:#111;background:#fff;border:1px solid var(--dsw-alias-brand-primary);border-radius:4px;outline:none;box-shadow:0 2px 10px rgba(0,0,0,.3)}'
    ].join('');

    /** Install this package's stylesheet once, and remove it when the plugin unloads. */
    function installStyles() {
      const existing = document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']');
      if (existing !== null) return () => {};
      const tag = document.createElement('style');
      tag.dataset.plugin = PLUGIN_ID;
      tag.dataset.pluginCss = STYLE_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return () => {
        tag.remove();
      };
    }

    // ---------------------------------------------------------------- storage

    /** Open (and migrate) the browser database that keeps the wall's records. */
    function openDatabase() {
      return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
          reject(new Error('IndexedDB is unavailable'));
          return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
        request.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
      });
    }

    /** Run one write transaction against the item store and settle when it commits. */
    function withStore(mode, run) {
      return openDatabase().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        try {
          run(transaction.objectStore(STORE));
        } catch (error) {
          db.close();
          reject(error);
          return;
        }
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error('IndexedDB transaction failed'));
        };
        transaction.onabort = () => {
          db.close();
          reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
        };
      }));
    }

    /** Every stored record. */
    function readAllRecords() {
      return openDatabase().then((db) => new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readonly');
        const request = transaction.objectStore(STORE).getAll();
        request.onsuccess = () => {
          db.close();
          resolve(request.result ?? []);
        };
        request.onerror = () => {
          db.close();
          reject(request.error ?? new Error('IndexedDB read failed'));
        };
      }));
    }

    /** Write one record. */
    function writeRecord(record) {
      return withStore('readwrite', (store) => {
        store.put(record);
      });
    }

    /** Remove one record. */
    function removeRecord(id) {
      return withStore('readwrite', (store) => {
        store.delete(id);
      });
    }

    /** Remove several records at once. */
    function removeRecords(ids) {
      if (ids.length === 0) return Promise.resolve();
      return withStore('readwrite', (store) => {
        for (const id of ids) store.delete(id);
      });
    }

    /** Read the board list from browser storage. */
    function readBoards() {
      try {
        const raw = localStorage.getItem(BOARDS_KEY);
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter((entry) => entry && typeof entry.id === 'string' && typeof entry.name === 'string')
          .map((entry) => ({ id: entry.id, name: entry.name }));
      } catch {
        return [];
      }
    }

    /** Write the board list back to browser storage. */
    function writeBoards(boards) {
      try {
        localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
      } catch {
        /* a full or disabled storage keeps the in-memory list only */
      }
    }

    /** Read the canvas preferences from browser storage. */
    function readLayout() {
      const fallback = { background: 'grid', gridSize: 24 };
      try {
        const raw = localStorage.getItem(LAYOUT_KEY);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return {
          background: parsed?.background === 'solid' ? 'solid' : 'grid',
          gridSize: Number.isFinite(parsed?.gridSize) ? Math.min(96, Math.max(12, parsed.gridSize)) : fallback.gridSize
        };
      } catch {
        return fallback;
      }
    }

    /** Write the canvas preferences back to browser storage. */
    function writeLayout(layout) {
      try {
        localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
      } catch {
        /* a full or disabled storage keeps the in-memory value only */
      }
    }

    /** A new identity. */
    function newId(prefix) {
      const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      return prefix + '-' + random;
    }

    /** Clamp a number into a range. */
    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    /** Read an image's pixel size without decoding it into the document. */
    async function readImageSize(blob) {
      try {
        if (typeof createImageBitmap === 'function') {
          const bitmap = await createImageBitmap(blob);
          const size = { width: bitmap.width, height: bitmap.height };
          bitmap.close();
          return size;
        }
      } catch {
        /* an unreadable header only costs the size hint */
      }
      return { width: 0, height: 0 };
    }

    /** Normalize one stored record into the canvas model. */
    function materialize(record, url) {
      const item = {
        id: record.id,
        type: record.type === 'text' ? 'text' : 'image',
        board: typeof record.board === 'string' ? record.board : '',
        title: typeof record.title === 'string' ? record.title : '',
        content: typeof record.content === 'string' ? record.content : '',
        width: Number.isFinite(record.width) ? record.width : DEFAULT_TEXT_W,
        height: Number.isFinite(record.height) ? record.height : DEFAULT_TEXT_H,
        x: Number.isFinite(record.x) ? record.x : 0,
        y: Number.isFinite(record.y) ? record.y : 0,
        zIndex: Number.isFinite(record.zIndex) ? record.zIndex : 1,
        createTime: Number.isFinite(record.createTime) ? record.createTime : Date.now(),
        url: url ?? '',
        hasBlob: record.blob instanceof Blob,
        blob: record.blob instanceof Blob ? record.blob : undefined
      };
      if (item.type === 'image') {
        item.width = clamp(item.width, MIN_IMAGE, MAX_BLOCK);
        item.height = clamp(item.height, MIN_IMAGE, MAX_BLOCK);
      } else {
        item.width = clamp(item.width, MIN_TEXT_W, MAX_BLOCK);
        item.height = clamp(item.height, MIN_TEXT_H, MAX_BLOCK);
      }
      return item;
    }

    /** Strip the volatile fields a record must not persist. */
    function persistable(item) {
      return {
        id: item.id,
        type: item.type,
        board: item.board,
        title: item.title,
        content: item.content,
        width: item.width,
        height: item.height,
        x: item.x,
        y: item.y,
        zIndex: item.zIndex,
        createTime: item.createTime
      };
    }

    // ------------------------------------------------------------------ state

    const wall = {
      snapshot: {
        status: 'loading',
        error: '',
        notice: '',
        noticeTone: 'info',
        items: [],
        boards: [],
        activeBoard: ALL,
        previewId: null,
        background: 'grid',
        gridSize: 24
      },
      listeners: new Set(),
      urls: new Map(),
      blobs: new Map()
    };

    /** The current immutable snapshot. */
    function getSnapshot() {
      return wall.snapshot;
    }

    /** Subscribe to snapshot changes. */
    function subscribe(listener) {
      wall.listeners.add(listener);
      return () => {
        wall.listeners.delete(listener);
      };
    }

    /** Publish a new snapshot. */
    function publish(patch) {
      wall.snapshot = { ...wall.snapshot, ...patch };
      for (const listener of [...wall.listeners]) listener();
    }

    /** Show a short notice in the panel. */
    function notify(text, tone) {
      publish({ notice: text, noticeTone: tone ?? 'info' });
    }

    /** The items of the board in force. */
    function visibleItems() {
      const { items, activeBoard } = wall.snapshot;
      if (activeBoard === ALL) return items;
      if (activeBoard === INBOX) return items.filter((item) => item.board === '');
      return items.filter((item) => item.board === activeBoard);
    }

    /** The next zIndex a new block takes. */
    function nextZ() {
      let top = 0;
      for (const item of wall.snapshot.items) if (item.zIndex > top) top = item.zIndex;
      return top + 1;
    }

    /** The lowest zIndex in force. */
    function lowestZ() {
      let low = 0;
      for (const item of wall.snapshot.items) if (item.zIndex < low) low = item.zIndex;
      return low;
    }

    /** Debounced write of every record, so a drag commits once. */
    let saveTimer = 0;
    let savePending = false;
    function scheduleSave() {
      savePending = true;
      if (saveTimer !== 0) return;
      saveTimer = window.setTimeout(() => {
        saveTimer = 0;
        if (!savePending) return;
        savePending = false;
        void flushSave();
      }, SAVE_DEBOUNCE_MS);
    }

    /** Write every item's record back, keeping blobs untouched and dropping what was removed. */
    async function flushSave() {
      try {
        const records = await readAllRecords();
        const live = new Set(wall.snapshot.items.map((item) => item.id));
        const byId = new Map(records.map((record) => [record.id, record]));
        const writes = [];
        for (const item of wall.snapshot.items) {
          const existing = byId.get(item.id);
          if (existing === undefined) continue;
          const record = persistable(item);
          if (existing.blob instanceof Blob) record.blob = existing.blob;
          writes.push(record);
        }
        const drops = records.filter((record) => !live.has(record.id));
        if (writes.length === 0 && drops.length === 0) return;
        await withStore('readwrite', (store) => {
          for (const record of writes) store.put(record);
          for (const record of drops) store.delete(record.id);
        });
      } catch {
        /* the in-memory layout stays authoritative; the next save retries */
      }
    }

    /** Load the wall's records and boards into the snapshot. */
    async function loadWall() {
      try {
        const records = await readAllRecords();
        const items = [];
        for (const record of records) {
          const { blob, ...meta } = record;
          if (blob instanceof Blob) {
            const url = URL.createObjectURL(blob);
            wall.urls.set(meta.id, url);
            wall.blobs.set(meta.id, blob);
          }
          items.push(materialize(meta, wall.urls.get(meta.id) ?? ''));
        }
        items.sort((left, right) => left.createTime - right.createTime);
        const layout = readLayout();
        publish({ status: 'ready', items, boards: readBoards(), background: layout.background, gridSize: layout.gridSize, error: '' });
      } catch (error) {
        publish({
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          boards: readBoards()
        });
      }
    }

    /** Whether one picked file is an image this wall can hold. */
    function isImageFile(file) {
      if (typeof file.type === 'string' && file.type.startsWith('image/')) return true;
      if (typeof file.name === 'string') return /\.(png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(file.name);
      return false;
    }

    /** Shrink an oversized image so the canvas and storage stay light. */
    async function normalizeImage(blob) {
      if (blob.size < 512 * 1024) return blob;
      let bitmap;
      try {
        bitmap = await createImageBitmap(blob);
      } catch {
        return blob;
      }
      const longest = Math.max(bitmap.width, bitmap.height);
      if (longest <= MAX_EDGE) {
        bitmap.close();
        return blob;
      }
      const scale = MAX_EDGE / longest;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (context === null) {
        bitmap.close();
        return blob;
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const encoded = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (encoded === null) return blob;
      return encoded.size < blob.size ? encoded : blob;
    }

    // -------------------------------------------------- image editing engine
    //
    // Ported from dsh-plugin-live-shot's browser annotator. One base bitmap plus
    // an ordered list of primitive operations, replayed on every repaint. Every
    // operation stores *image pixel* coordinates, so the marks stay put when the
    // editing canvas is displayed at another size and when the image is resized
    // on export.

    /** The box covering two points, in image pixels. */
    function boxOf(a, b) {
      return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y)
      };
    }

    /** Average one region into blocks, for the mosaic tool. */
    function paintMosaic(context, rect, weight) {
      const canvas = context.canvas;
      const x = Math.max(0, Math.floor(rect.x));
      const y = Math.max(0, Math.floor(rect.y));
      const w = Math.min(canvas.width, Math.ceil(rect.x + rect.width)) - x;
      const h = Math.min(canvas.height, Math.ceil(rect.y + rect.height)) - y;
      if (w <= 0 || h <= 0) return;
      const pixels = context.getImageData(x, y, w, h);
      const step = Math.max(8, Math.round(weight * 4));
      for (let by = 0; by < pixels.height; by += step) {
        for (let bx = 0; bx < pixels.width; bx += step) {
          let red = 0;
          let green = 0;
          let blue = 0;
          let count = 0;
          const bw = Math.min(step, pixels.width - bx);
          const bh = Math.min(step, pixels.height - by);
          for (let dy = 0; dy < bh; dy += 1) {
            for (let dx = 0; dx < bw; dx += 1) {
              const i = ((by + dy) * pixels.width + bx + dx) * 4;
              red += pixels.data[i];
              green += pixels.data[i + 1];
              blue += pixels.data[i + 2];
              count += 1;
            }
          }
          context.fillStyle = `rgb(${Math.round(red / count)},${Math.round(green / count)},${Math.round(blue / count)})`;
          context.fillRect(x + bx, y + by, bw, bh);
        }
      }
    }

    /** Paint one operation onto a 2D context. */
    function paintOp(context, op) {
      const points = op.points;
      if (!Array.isArray(points) || points.length === 0) return;
      const first = points[0];
      const last = points[points.length - 1];
      const rect = boxOf(first, last);
      context.save();
      context.strokeStyle = op.color;
      context.fillStyle = op.color;
      context.lineWidth = op.width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      if (op.tool === 'rect') {
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      } else if (op.tool === 'ellipse') {
        context.beginPath();
        context.ellipse(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
          Math.max(0.1, rect.width / 2),
          Math.max(0.1, rect.height / 2),
          0, 0, Math.PI * 2
        );
        context.stroke();
      } else if (op.tool === 'arrow') {
        const angle = Math.atan2(last.y - first.y, last.x - first.x);
        const head = Math.max(12, op.width * 4);
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(last.x, last.y);
        context.stroke();
        context.beginPath();
        context.moveTo(last.x, last.y);
        context.lineTo(last.x - head * Math.cos(angle - 0.45), last.y - head * Math.sin(angle - 0.45));
        context.lineTo(last.x - head * Math.cos(angle + 0.45), last.y - head * Math.sin(angle + 0.45));
        context.closePath();
        context.fill();
      } else if (op.tool === 'pen') {
        context.beginPath();
        context.moveTo(first.x, first.y);
        for (const point of points) context.lineTo(point.x, point.y);
        context.stroke();
      } else if (op.tool === 'text') {
        context.font = `${Math.round(op.width * 4 + 14)}px "Segoe UI", system-ui, sans-serif`;
        context.textBaseline = 'top';
        if (op.text) context.fillText(op.text, first.x, first.y);
      } else if (op.tool === 'mosaic') {
        paintMosaic(context, rect, op.width);
      }
      context.restore();
    }

    /** Replay the committed operations and the in-flight draft over the base bitmap. */
    function renderEditorOps(context, base, ops, draft) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      if (base) context.drawImage(base, 0, 0);
      for (const op of ops) paintOp(context, op);
      if (draft) paintOp(context, draft);
    }

    /** Encode a canvas with the chosen media type and quality. */
    function encodeCanvas(canvas, type, quality) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob === null) {
            reject(new Error('canvas encoding failed'));
            return;
          }
          resolve(blob);
        }, type, type === 'image/jpeg' || type === 'image/webp' ? quality : undefined);
      });
    }

    /**
     * Replace one image block's bytes in place.
     *
     * The wall keeps blobs in memory and their object URLs beside them, and the
     * debounced save deliberately reuses the stored blob, so a replaced image
     * has to be written straight through here instead of through scheduleSave.
     * The block's own box follows the new aspect ratio so the picture stays
     * uncropped. The item's title is updated to reflect the new image extension.
     */
    async function replaceImageBlob(id, blob) {
      const item = wall.snapshot.items.find((entry) => entry.id === id);
      if (item === undefined) return;
      const previousUrl = wall.urls.get(id);
      const size = await readImageSize(blob);
      wall.blobs.set(id, blob);
      const url = URL.createObjectURL(blob);
      wall.urls.set(id, url);
      if (previousUrl !== undefined) URL.revokeObjectURL(previousUrl);
      const type = blob.type || 'image/png';
      const extension = IMAGE_EXTENSIONS[type] ?? 'png';
      let title = item.title;
      if (typeof title === 'string' && title.trim() !== '') {
        title = title.replace(/\.(png|jpe?g|gif|webp|bmp|avif|svg)$/i, '') + '.' + extension;
      } else {
        title = 'moodboard-' + id + '.' + extension;
      }
      const patch = { url, hasBlob: true, title };
      if (size.width > 0 && size.height > 0) {
        // Keep the block's width; adjust its height to the image's own aspect.
        patch.height = clamp(Math.round(item.width * (size.height / size.width)), MIN_IMAGE, MAX_BLOCK);
      }
      updateItem(id, patch, false);
      const next = wall.snapshot.items.find((entry) => entry.id === id) ?? { ...item, ...patch };
      const record = persistable(next);
      record.blob = blob;
      try {
        await writeRecord(record);
      } catch {
        /* the in-memory copy stays authoritative; a later save rewrites it */
      }
    }

    /** Add image files to the wall. */
    async function addFiles(files, board, at) {
      const images = [...files].filter((file) => isImageFile(file));
      if (images.length === 0) return { added: 0, images: 0 };
      const room = MAX_ITEMS - wall.snapshot.items.length;
      if (room <= 0) return { added: 0, images: images.length };
      const accepted = images.slice(0, room);
      const created = [];
      for (const file of accepted) {
        const blob = await normalizeImage(file);
        const id = newId('img');
        const size = await readImageSize(blob);
        const record = {
          id,
          type: 'image',
          blob,
          board: board ?? '',
          title: typeof file.name === 'string' ? file.name : '',
          content: '',
          width: size.width > 0 ? size.width : 240,
          height: size.height > 0 ? size.height : 180,
          x: 0,
          y: 0,
          zIndex: 1,
          createTime: Date.now()
        };
        await writeRecord(record);
        const url = URL.createObjectURL(blob);
        wall.urls.set(id, url);
        wall.blobs.set(id, blob);
        created.push(materialize(fitInitial(record), url));
      }
      publish({ items: [...wall.snapshot.items, ...created] });
      if (at !== undefined) placeNew(created, at);
      return { added: created.length, images: images.length };
    }

    /** Fit a freshly recorded image into a readable opening size, keeping its aspect ratio. */
    function fitInitial(record) {
      if (record.type !== 'image' || record.width <= 0 || record.height <= 0) return record;
      const longest = Math.max(record.width, record.height);
      if (longest <= FIT_EDGE) return record;
      const scale = FIT_EDGE / longest;
      return { ...record, width: Math.round(record.width * scale), height: Math.round(record.height * scale) };
    }

    /** Add a text block. */
    async function addText(board, at, initialText) {
      if (wall.snapshot.items.length >= MAX_ITEMS) return undefined;
      const id = newId('txt');
      const text = typeof initialText === 'string' ? initialText : '';
      const record = {
        id,
        type: 'text',
        board: board ?? '',
        title: '',
        content: text,
        width: DEFAULT_TEXT_W,
        height: DEFAULT_TEXT_H,
        x: 0,
        y: 0,
        zIndex: 1,
        createTime: Date.now()
      };
      await writeRecord(record);
      const item = materialize(record);
      publish({ items: [...wall.snapshot.items, item] });
      if (at !== undefined) placeNew([item], at);
      return id;
    }

    /** Give freshly added blocks a position and a place at the top of the stack. */
    function placeNew(items, at) {
      if (items.length === 0) return;
      const top = nextZ();
      const byId = new Map(items.map((item, index) => [item.id, {
        ...item,
        x: Math.max(0, Math.round(at.x + index * 16)),
        y: Math.max(0, Math.round(at.y + index * 16)),
        zIndex: top + index
      }]));
      publish({ items: wall.snapshot.items.map((item) => byId.get(item.id) ?? item) });
      scheduleSave();
    }

    /** Remove one item from the wall. */
    async function removeItem(id) {
      const url = wall.urls.get(id);
      if (url !== undefined) {
        URL.revokeObjectURL(url);
        wall.urls.delete(id);
      }
      wall.blobs.delete(id);
      await removeRecord(id);
      publish({
        items: wall.snapshot.items.filter((item) => item.id !== id),
        previewId: wall.snapshot.previewId === id ? null : wall.snapshot.previewId
      });
    }

    /** Update one item's geometry or metadata. */
    function updateItem(id, patch, persist) {
      const item = wall.snapshot.items.find((entry) => entry.id === id);
      if (item === undefined) return;
      const next = { ...item, ...patch };
      publish({ items: wall.snapshot.items.map((entry) => (entry.id === id ? next : entry)) });
      if (persist === false) return;
      scheduleSave();
    }

    /** Move one item to the top or the bottom of the stack. */
    function restack(id, edge) {
      const zIndex = edge === 'front' ? nextZ() : Math.min(0, lowestZ() - 1);
      updateItem(id, { zIndex }, false);
      scheduleSave();
    }

    /** Remove every item of the board in force. */
    async function clearBoard() {
      const items = visibleItems();
      if (items.length === 0) return;
      for (const item of items) {
        const url = wall.urls.get(item.id);
        if (url !== undefined) {
          URL.revokeObjectURL(url);
          wall.urls.delete(item.id);
        }
        wall.blobs.delete(item.id);
      }
      await removeRecords(items.map((item) => item.id));
      const removed = new Set(items.map((item) => item.id));
      publish({
        items: wall.snapshot.items.filter((item) => !removed.has(item.id)),
        previewId: removed.has(wall.snapshot.previewId) ? null : wall.snapshot.previewId
      });
    }

    /** Create a board and make it the board in force. */
    function createBoard(name) {
      const trimmed = name.trim();
      if (trimmed === '') return;
      const board = { id: newId('board'), name: trimmed };
      const boards = [...wall.snapshot.boards, board];
      writeBoards(boards);
      publish({ boards, activeBoard: board.id });
    }

    /** Remove a board; its items become unfiled. */
    async function removeBoard(id) {
      const boards = wall.snapshot.boards.filter((board) => board.id !== id);
      writeBoards(boards);
      publish({
        boards,
        activeBoard: wall.snapshot.activeBoard === id ? ALL : wall.snapshot.activeBoard,
        items: wall.snapshot.items.map((item) => (item.board === id ? { ...item, board: '' } : item))
      });
      scheduleSave();
    }

    /** The blob of one item, from memory or from storage. */
    async function blobOf(id) {
      const held = wall.blobs.get(id);
      if (held !== undefined) return held;
      const records = await readAllRecords();
      const record = records.find((entry) => entry.id === id);
      if (record === undefined || !(record.blob instanceof Blob)) return undefined;
      wall.blobs.set(id, record.blob);
      return record.blob;
    }

    /** Tidy every visible block into a left-to-right, top-to-bottom flow. */
    function arrangeVisible() {
      const items = visibleItems().slice().sort((left, right) => left.createTime - right.createTime);
      if (items.length === 0) return;
      const widest = Math.max(...items.map((item) => item.width));
      const columns = Math.max(1, Math.floor(560 / Math.max(1, widest)));
      const byId = new Map();
      let x = 0;
      let y = 0;
      let rowHeight = 0;
      let column = 0;
      for (const item of items) {
        byId.set(item.id, { ...item, x, y });
        rowHeight = Math.max(rowHeight, item.height);
        column += 1;
        if (column >= columns) {
          column = 0;
          x = 0;
          y += rowHeight + 12;
          rowHeight = 0;
        } else {
          x += item.width + 12;
        }
      }
      publish({ items: wall.snapshot.items.map((item) => byId.get(item.id) ?? item) });
      scheduleSave();
    }

    // -------------------------------------------------------------- composer

    /** The file extension this media type is submitted under. */
    const IMAGE_EXTENSIONS = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/avif': 'avif',
      'image/svg+xml': 'svg'
    };

    /**
     * Put images into the current conversation's draft.
     *
     * The composer's attachment intake is owned by the Conversation controller: it
     * stages browser files as draft attachments, and the mounted composer admits
     * their ids. Both halves are reached through the standard props this seat is
     * rendered with, so the wall never invents a private channel.
     */
    async function sendToComposer(getConversation, inputActions, sessionId, ids) {
      if (sessionId === undefined || sessionId === null) throw new Error('noSession');
      const conversation = typeof getConversation === 'function' ? getConversation() : undefined;
      if (conversation === undefined || typeof conversation.createDrafts !== 'function') throw new Error('noIntake');
      if (inputActions === undefined || typeof inputActions.addAttachments !== 'function') throw new Error('noComposer');
      const files = [];
      for (const id of ids) {
        const blob = await blobOf(id);
        if (blob === undefined) continue;
        const type = blob.type || 'image/png';
        const extension = IMAGE_EXTENSIONS[type] ?? 'png';
        files.push(new File([blob], 'moodboard-' + id + '.' + extension, { type }));
      }
      if (files.length === 0) throw new Error('noImages');
      const drafts = conversation.createDrafts(sessionId, files, true);
      if (!inputActions.addAttachments(drafts.map((draft) => draft.id))) {
        conversation.releaseDraftAttachments?.(drafts);
        throw new Error('locked');
      }
      return drafts.length;
    }

    /** Which copy each failed send reports; an unmapped reason falls through to the generic line. */
    const SEND_FAILURES = {
      noSession: 'error.noSession',
      noIntake: 'error.noIntake',
      noComposer: 'error.noIntake',
      noImages: 'error.noImages',
      locked: 'error.locked'
    };

    /** Download one blob under a file name. */
    function downloadBlob(blob, name) {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    /** A safe file name for one item, stripping any existing image extension before applying the target one. */
    function fileNameOf(item, extension) {
      let base = (item.title || 'moodboard-' + item.id).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80);
      if (extension !== undefined) {
        base = base.replace(/\.(png|jpe?g|gif|webp|bmp|avif|svg)$/i, '');
        return base + '.' + extension;
      }
      return base;
    }

    // ------------------------------------------------------------- components

    /** A small glyph set drawn with the current ink. */
    function glyph(paths, size) {
      return function Glyph(props) {
        return h(
          'svg',
          {
            width: props.size ?? size ?? 14,
            height: props.size ?? size ?? 14,
            viewBox: '0 0 16 16',
            fill: 'none',
            'aria-hidden': 'true',
            className: props.className
          },
          paths
        );
      };
    }

    const IconPlus = glyph([
      h('path', { d: 'M8 3.2v9.6M3.2 8h9.6', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' })
    ]);
    const IconTrash = glyph([
      h('path', { d: 'M3.4 4.6h9.2M6.4 4.6V3.4h3.2v1.2M4.6 4.6l.6 8h5.6l.6-8', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' })
    ]);
    const IconDownload = glyph([
      h('path', { d: 'M8 2.6v7.2M5 7l3 3 3-3M3.4 12.6h9.2', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' })
    ]);
    const IconSend = glyph([
      h('path', { d: 'M13.4 2.6L2.6 7.2l4.1 1.6 1.6 4.1z', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' })
    ]);
    const IconClose = glyph([
      h('path', { d: 'M4 4l8 8M12 4l-8 8', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' })
    ]);
    const IconEdit = glyph([
      h('path', { d: 'M10.4 2.8l2.8 2.8-7.2 7.2-3.4.6.6-3.4z', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }),
      h('path', { d: 'M9.2 4l2.8 2.8', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' })
    ]);
    const IconText = glyph([
      h('path', { d: 'M3.4 3.6h9.2M8 3.6v8.8M6 12.4h4', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' })
    ]);
    const IconCopy = glyph([
      h('rect', { x: 5.4, y: 5.4, width: 7.2, height: 7.2, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.3 }),
      h('path', { d: 'M10.6 5.4V4.2a1.2 1.2 0 0 0-1.2-1.2H4.2A1.2 1.2 0 0 0 3 4.2v5.2a1.2 1.2 0 0 0 1.2 1.2h1.2', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' })
    ]);
    const IconFront = glyph([
      h('rect', { x: 2.6, y: 2.6, width: 7.4, height: 7.4, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.55 }),
      h('rect', { x: 6, y: 6, width: 7.4, height: 7.4, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.3 })
    ]);
    const IconBack = glyph([
      h('rect', { x: 6, y: 6, width: 7.4, height: 7.4, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.55 }),
      h('rect', { x: 2.6, y: 2.6, width: 7.4, height: 7.4, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.3 })
    ]);
    const IconGrid = glyph([
      h('path', { d: 'M2.6 2.6h10.8v10.8H2.6zM2.6 6.2h10.8M2.6 9.8h10.8M6.2 2.6v10.8M9.8 2.6v10.8', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' })
    ]);
    const IconExport = glyph([
      h('path', { d: 'M8 2.4v7M5.4 6.6L8 9.2l2.6-2.6M3.2 12.2h9.6', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' })
    ]);
    const IconBoard = glyph([
      h('rect', { x: 2.2, y: 3, width: 8, height: 6.4, rx: 1.2, stroke: 'currentColor', strokeWidth: 1.2 }),
      h('rect', { x: 6.4, y: 6.6, width: 7.4, height: 6.4, rx: 1.2, stroke: 'currentColor', strokeWidth: 1.2 })
    ]);
    const IconMove = glyph([
      h('path', {
        d: 'M8 2.2v11.6M2.2 8h11.6M8 2.2l-2 2M8 2.2l2 2M8 13.8l-2-2M8 13.8l2-2M2.2 8l2-2M2.2 8l2 2M13.8 8l-2-2M13.8 8l2 2',
        stroke: 'currentColor',
        strokeWidth: 1.25,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      })
    ]);

    /** The tools the annotation tab offers, with their glyph path. */
    const EDITOR_TOOLS = [
      { id: 'rect', key: 'edit.tool.rect', icon: 'M3 4h10v8H3z' },
      { id: 'ellipse', key: 'edit.tool.ellipse', icon: 'M8 3.5c3 0 5 2 5 4.5s-2 4.5-5 4.5-5-2-5-4.5 2-4.5 5-4.5z' },
      { id: 'arrow', key: 'edit.tool.arrow', icon: 'M3 13L12 4M12 4H8M12 4v4' },
      { id: 'pen', key: 'edit.tool.pen', icon: 'M3 13l1-3 7-7 2 2-7 7-3 1z' },
      { id: 'mosaic', key: 'edit.tool.mosaic', icon: 'M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z' },
      { id: 'text', key: 'edit.tool.text', icon: 'M4 3h8M8 3v10' }
    ];

    /** The output encoders this editor offers. */
    const EDITOR_FORMATS = [
      { id: 'image/png', label: 'PNG' },
      { id: 'image/jpeg', label: 'JPEG' },
      { id: 'image/webp', label: 'WebP' }
    ];

    /**
     * Full-screen editor for one wall image: mark it up, resize it, and re-encode it.
     *
     * The canvas holds the image at its own pixel size and the operations live in
     * that same coordinate space, so resizing only changes the export size: the
     * composed bitmap is drawn into a second canvas at the target box.
     */
    function ImageEditor(props) {
      const { t, item, blob, onError, onSave, onClose } = props;
      const canvasRef = useRef(null);
      const imageRef = useRef(null);
      const textRef = useRef(null);
      const ratioRef = useRef(1);
      const [tab, setTab] = useState('annotate');
      const [tool, setTool] = useState('rect');
      const [color, setColor] = useState('#ff3b30');
      const [weight, setWeight] = useState(3);
      const [ops, setOps] = useState([]);
      const [draft, setDraft] = useState(null);
      const [natural, setNatural] = useState({ width: 0, height: 0 });
      const [ready, setReady] = useState(false);
      const [width, setWidth] = useState(0);
      const [height, setHeight] = useState(0);
      const [lock, setLock] = useState(true);
      const initialFormat = blob instanceof Blob && typeof blob.type === 'string' && EDITOR_FORMATS.some((entry) => entry.id === blob.type)
        ? blob.type
        : 'image/png';
      const [format, setFormat] = useState(initialFormat);
      const [quality, setQuality] = useState(0.92);
      const [estimate, setEstimate] = useState('');
      const [busy, setBusy] = useState(false);
      const opsRef = useRef(ops);
      const draftRef = useRef(draft);
      opsRef.current = ops;
      draftRef.current = draft;

      /** Load the block's bytes once and size the canvas to them. */
      useEffect(() => {
        let cancelled = false;
        const canvas = canvasRef.current;
        if (canvas === null || blob instanceof Blob === false) return undefined;
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          if (cancelled) return;
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          imageRef.current = image;
          ratioRef.current = image.naturalWidth / Math.max(1, image.naturalHeight);
          setNatural({ width: image.naturalWidth, height: image.naturalHeight });
          setWidth(image.naturalWidth);
          setHeight(image.naturalHeight);
          setReady(true);
          const context = canvas.getContext('2d');
          if (context !== null) renderEditorOps(context, image, [], null);
        };
        image.onerror = () => {
          if (!cancelled) onError(t('error.edit', { message: 'image decode failed' }));
        };
        image.src = url;
        return () => {
          cancelled = true;
          URL.revokeObjectURL(url);
        };
      }, [blob, onError, t]);

      /** Repaint whenever the committed operations or the draft change. */
      useEffect(() => {
        if (!ready) return;
        const canvas = canvasRef.current;
        const context = canvas === null ? null : canvas.getContext('2d');
        if (canvas === null || context === null) return;
        renderEditorOps(context, imageRef.current, ops, draft);
      }, [ops, draft, ready]);

      /** Escape closes the editor. */
      useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape' && textRef.current?.hidden === true) onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [onClose]);

      /** Map a pointer position into image pixel coordinates. */
      const imagePoint = useCallback((event) => {
        const canvas = canvasRef.current;
        if (canvas === null) return { x: 0, y: 0 };
        const box = canvas.getBoundingClientRect();
        return {
          x: clamp(((event.clientX - box.left) * canvas.width) / box.width, 0, canvas.width),
          y: clamp(((event.clientY - box.top) * canvas.height) / box.height, 0, canvas.height)
        };
      }, []);

      /** Commit the pending text operation. */
      const commitText = useCallback(() => {
        const field = textRef.current;
        if (field === null || field.hidden) return;
        const value = field.value.trim();
        const current = draftRef.current;
        field.hidden = true;
        if (current === null) return;
        if (value !== '') setOps((existing) => [...existing, { ...current, text: value }]);
        setDraft(null);
      }, []);

      /** Begin a stroke or place the text box. */
      const onPointerDown = useCallback((event) => {
        if (!ready || event.button !== 0) return;
        const canvas = canvasRef.current;
        if (canvas === null) return;
        event.preventDefault();
        // Pointer capture throws once the id is no longer active (a synthetic
        // event, or a pointer released between dispatch and handling), and an
        // uncaught throw here would drop the whole stroke.
        try { canvas.setPointerCapture(event.pointerId); } catch { /* the stroke still tracks */ }
        const point = imagePoint(event);
        const box = canvas.getBoundingClientRect();
        const scale = box.width > 0 ? canvas.width / box.width : 1;
        const operation = { tool, points: [point], color, width: Math.max(1, weight * scale) };
        setDraft(operation);
        if (tool === 'text') {
          const field = textRef.current;
          if (field !== null) {
            field.value = '';
            field.style.left = `${clamp(event.clientX, 8, window.innerWidth - 240)}px`;
            field.style.top = `${clamp(event.clientY, 8, window.innerHeight - 48)}px`;
            field.hidden = false;
            field.focus();
          }
        }
      }, [ready, tool, color, weight, imagePoint]);

      /** Extend the in-flight stroke. */
      const onPointerMove = useCallback((event) => {
        const current = draftRef.current;
        if (current === null || current.tool === 'text') return;
        const point = imagePoint(event);
        if (current.tool === 'pen') setDraft({ ...current, points: [...current.points, point] });
        else setDraft({ ...current, points: [current.points[0], point] });
      }, [imagePoint]);

      /** Finish the in-flight stroke. */
      const onPointerUp = useCallback(() => {
        const current = draftRef.current;
        if (current === null) return;
        setDraft(null);
        if (current.tool === 'text') return;
        setOps((existing) => [...existing, current]);
      }, []);

      /** Compose the base bitmap, the marks, and the export box into one blob. */
      const compose = useCallback(async () => {
        const canvas = canvasRef.current;
        if (canvas === null) return undefined;
        const targetWidth = clamp(Math.round(width) || canvas.width, 1, 8192);
        const targetHeight = clamp(Math.round(height) || canvas.height, 1, 8192);
        const resized = targetWidth !== canvas.width || targetHeight !== canvas.height;
        // JPEG has no alpha, so anything transparent would come out black:
        // flatten the picture onto white whenever it is not preserved.
        const flatten = format === 'image/jpeg';
        if (!resized && !flatten) return encodeCanvas(canvas, format, quality);
        const output = document.createElement('canvas');
        output.width = targetWidth;
        output.height = targetHeight;
        const context = output.getContext('2d');
        if (context === null) return undefined;
        if (flatten) {
          context.fillStyle = '#fff';
          context.fillRect(0, 0, targetWidth, targetHeight);
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(canvas, 0, 0, targetWidth, targetHeight);
        return encodeCanvas(output, format, quality);
      }, [format, quality, width, height]);

      /** Keep the estimate honest without encoding on every keystroke. */
      useEffect(() => {
        if (!ready) return undefined;
        let cancelled = false;
        const timer = window.setTimeout(() => {
          void compose().then((result) => {
            if (cancelled || result === undefined) return;
            const kilobytes = result.size / 1024;
            const size = kilobytes >= 1024
              ? (kilobytes / 1024).toFixed(1) + ' MB'
              : Math.max(1, Math.round(kilobytes)) + ' KB';
            const label = EDITOR_FORMATS.find((entry) => entry.id === format)?.label ?? 'PNG';
            setEstimate(t('edit.result', {
              width: clamp(Math.round(width) || natural.width, 1, 8192),
              height: clamp(Math.round(height) || natural.height, 1, 8192),
              type: label,
              size
            }));
          }).catch(() => { /* the estimate is advisory only */ });
        }, 600);
        return () => {
          cancelled = true;
          window.clearTimeout(timer);
        };
      }, [ready, compose, width, height, format, natural.width, natural.height, t, ops]);

      /** Save the composed bytes back to the block. */
      const save = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        try {
          const result = await compose();
          if (result === undefined) throw new Error('nothing to encode');
          onSave(result);
        } catch (error) {
          onError(t('error.edit', { message: error instanceof Error ? error.message : String(error) }));
        } finally {
          setBusy(false);
        }
      }, [busy, compose, onSave, onError, t]);

      /** Apply a width the user typed, keeping the aspect when it is locked. */
      const changeWidth = useCallback((value) => {
        const next = clamp(Math.round(Number(value)) || 1, 1, 8192);
        setWidth(next);
        if (lock) setHeight(clamp(Math.round(next / Math.max(0.0001, ratioRef.current)), 1, 8192));
      }, [lock]);

      /** Apply a height the user typed, keeping the aspect when it is locked. */
      const changeHeight = useCallback((value) => {
        const next = clamp(Math.round(Number(value)) || 1, 1, 8192);
        setHeight(next);
        if (lock) setWidth(clamp(Math.round(next * ratioRef.current), 1, 8192));
      }, [lock]);

      const lossy = format !== 'image/png';

      return h(
        'div',
        { className: 'mbw-editor', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('edit.title') },
        h(
          'div',
          { className: 'mbw-editorBar' },
          h('span', { className: 'mbw-editorTitle' }, item.title || t('edit.title')),
          h('span', { className: 'mbw-editorSpacer' }),
          h('button', { type: 'button', className: 'mbw-btn', onClick: onClose }, t('edit.cancel')),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              'data-variant': 'primary',
              disabled: busy || !ready,
              onClick: () => { commitText(); void save(); }
            },
            busy ? '…' : t('edit.save')
          )
        ),
        h(
          'div',
          { className: 'mbw-editorTabs' },
          [
            { id: 'annotate', label: t('edit.tab.annotate') },
            { id: 'resize', label: t('edit.tab.resize') },
            { id: 'format', label: t('edit.tab.format') }
          ].map((entry) =>
            h(
              'button',
              {
                key: entry.id,
                type: 'button',
                className: 'mbw-editorTab',
                'data-active': String(tab === entry.id),
                onClick: () => { commitText(); setTab(entry.id); }
              },
              entry.label
            )
          )
        ),
        h(
          'div',
          { className: 'mbw-editorStage' },
          h('canvas', {
            ref: canvasRef,
            className: 'mbw-editorCanvas',
            'data-tool': tab === 'annotate' ? tool : 'none',
            style: tab === 'annotate' ? undefined : { cursor: 'default' },
            onPointerDown: tab === 'annotate' ? onPointerDown : undefined,
            onPointerMove: tab === 'annotate' ? onPointerMove : undefined,
            onPointerUp: tab === 'annotate' ? onPointerUp : undefined,
            onPointerCancel: tab === 'annotate' ? onPointerUp : undefined
          })
        ),
        tab === 'annotate'
          ? h(
            'div',
            { className: 'mbw-editorPanel' },
            h(
              'div',
              { className: 'mbw-editorTools' },
              EDITOR_TOOLS.map((entry) =>
                h(
                  'button',
                  {
                    key: entry.id,
                    type: 'button',
                    className: 'mbw-editorTool',
                    title: t(entry.key),
                    'aria-label': t(entry.key),
                    'data-active': String(tool === entry.id),
                    onClick: () => { commitText(); setTool(entry.id); }
                  },
                  h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' },
                    h('path', { d: entry.icon, stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }))
                )
              )
            ),
            h('input', {
              type: 'color',
              className: 'mbw-editorColor',
              title: t('edit.color'),
              'aria-label': t('edit.color'),
              value: color,
              onChange: (event) => setColor(event.target.value)
            }),
            h('input', {
              type: 'range',
              className: 'mbw-editorRange',
              min: 1,
              max: 10,
              value: weight,
              title: t('edit.weight'),
              'aria-label': t('edit.weight'),
              onChange: (event) => setWeight(Number(event.target.value))
            }),
            h('button', {
              type: 'button',
              className: 'mbw-btn',
              disabled: ops.length === 0,
              onClick: () => setOps((existing) => existing.slice(0, -1))
            }, t('edit.undo')),
            h('button', {
              type: 'button',
              className: 'mbw-btn',
              disabled: ops.length === 0,
              onClick: () => setOps([])
            }, t('edit.clearMarks')),
            estimate ? h('span', { className: 'mbw-editorMeta' }, estimate) : null
          )
          : tab === 'resize'
            ? h(
              'div',
              { className: 'mbw-editorPanel' },
              h(
                'label',
                { className: 'mbw-editorField' },
                t('edit.width'),
                h('input', {
                  type: 'number',
                  className: 'mbw-editorNum',
                  min: 1,
                  max: 8192,
                  value: width,
                  onChange: (event) => changeWidth(event.target.value)
                })
              ),
              h(
                'label',
                { className: 'mbw-editorField' },
                t('edit.height'),
                h('input', {
                  type: 'number',
                  className: 'mbw-editorNum',
                  min: 1,
                  max: 8192,
                  value: height,
                  onChange: (event) => changeHeight(event.target.value)
                })
              ),
              h(
                'label',
                { className: 'mbw-editorField' },
                h('input', {
                  type: 'checkbox',
                  checked: lock,
                  onChange: (event) => setLock(event.target.checked)
                }),
                t('edit.lockAspect')
              ),
              h('button', {
                type: 'button',
                className: 'mbw-btn',
                onClick: () => { setWidth(natural.width); setHeight(natural.height); }
              }, t('edit.original')),
              estimate ? h('span', { className: 'mbw-editorMeta' }, estimate) : null
            )
            : h(
              'div',
              { className: 'mbw-editorPanel' },
              h(
                'label',
                { className: 'mbw-editorField' },
                t('edit.format'),
                h(
                  'select',
                  {
                    className: 'mbw-select',
                    value: format,
                    onChange: (event) => setFormat(event.target.value)
                  },
                  EDITOR_FORMATS.map((entry) => h('option', { key: entry.id, value: entry.id }, entry.label))
                )
              ),
              lossy
                ? h(
                  'label',
                  { className: 'mbw-editorField' },
                  t('edit.quality'),
                  h('input', {
                    type: 'range',
                    className: 'mbw-editorRange',
                    min: 0.4,
                    max: 1,
                    step: 0.02,
                    value: quality,
                    onChange: (event) => setQuality(Number(event.target.value))
                  }),
                  h('span', {}, Math.round(quality * 100) + '%')
                )
                : null,
              estimate ? h('span', { className: 'mbw-editorMeta' }, estimate) : null
            ),
        h('input', {
          ref: textRef,
          type: 'text',
          className: 'mbw-editorTextBox',
          placeholder: t('edit.textPlaceholder'),
          'aria-label': t('edit.tool.text'),
          hidden: true,
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitText();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              if (textRef.current !== null) textRef.current.hidden = true;
              setDraft(null);
            }
          },
          onBlur: commitText
        })
      );
    }

    /** One canvas block: an image or an editable text card. */
    function Block(props) {
      const { item, t, selected, limits, onSelect, onCommit, onOpenMenu, onPreview } = props;
      const blockRef = useRef(null);

      /** Begin a move or a resize; the gesture ends on the window. */
      const begin = useCallback((event, mode) => {
        if (event.button !== 0) return;
        if (blockRef.current === null) return;
        event.preventDefault();
        event.stopPropagation();
        onSelect(item.id);
        const startX = event.clientX;
        const startY = event.clientY;
        const origin = { x: item.x, y: item.y, width: item.width, height: item.height };
        const ratio = origin.height > 0 ? origin.width / origin.height : 1;
        /** Keep a block inside the canvas: never left/above the origin, never past the right edge or the stage's floor. */
        const bound = (next) => {
          const width = Math.min(next.width, limits.width);
          const height = Math.min(next.height, limits.height);
          return {
            ...next,
            width,
            height,
            x: clamp(next.x, -width + 48, Math.max(0, limits.width - 48)),
            y: clamp(next.y, 0, Math.max(0, limits.height - 48))
          };
        };
        let latest = bound(origin);
        let frame = 0;
        const paint = () => {
          frame = 0;
          onCommit(item.id, latest);
        };
        const schedule = (next) => {
          latest = bound(next);
          if (frame === 0) frame = window.requestAnimationFrame(paint);
        };
        const onMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (mode === 'move') {
            schedule({ ...origin, x: origin.x + dx, y: origin.y + dy });
            return;
          }
          if (item.type === 'image') {
            const width = clamp(origin.width + dx, MIN_IMAGE, MAX_BLOCK);
            const height = clamp(Math.round(width / ratio), MIN_IMAGE, MAX_BLOCK);
            schedule({ ...origin, width, height });
            return;
          }
          schedule({
            ...origin,
            width: clamp(origin.width + dx, MIN_TEXT_W, MAX_BLOCK),
            height: clamp(origin.height + dy, MIN_TEXT_H, MAX_BLOCK)
          });
        };
        const onUp = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          if (frame !== 0) {
            window.cancelAnimationFrame(frame);
            frame = 0;
          }
          onCommit(item.id, latest);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      }, [item.id, item.type, item.x, item.y, item.width, item.height, limits, onCommit, onSelect]);

      const image = item.type === 'image';
      return h(
        'div',
        {
          ref: blockRef,
          className: 'mbw-block',
          'data-mbw-block': item.id,
          'data-mbw-type': item.type,
          'data-selected': String(selected),
          style: { left: item.x + 'px', top: item.y + 'px', width: item.width + 'px', height: item.height + 'px', zIndex: item.zIndex },
          onMouseDown: (event) => {
            if (event.button !== 0) return;
            if (event.target.closest('.mbw-blockBtn') !== null) return;
            if (event.target.closest('.mbw-blockText') !== null) return;
            begin(event, 'move');
          },
          onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(item.id);
            onOpenMenu(item.id, event.clientX, event.clientY);
          },
          onDoubleClick: () => {
            if (image) onPreview(item.id);
          }
        },
        image
          ? h('img', {
            className: 'mbw-blockImage',
            src: item.url,
            alt: item.title || '',
            draggable: false
          })
          : h('textarea', {
            className: 'mbw-blockText',
            value: item.content,
            placeholder: t('text.placeholder'),
            'aria-label': t('field.note'),
            onMouseDown: (event) => event.stopPropagation(),
            onChange: (event) => onCommit(item.id, { content: event.target.value })
          }),
        image && item.title ? h('span', { className: 'mbw-blockTitle' }, item.title) : null,
        h(
          'div',
          { className: 'mbw-blockBar' },
          !image
            ? h(
              'button',
              {
                type: 'button',
                className: 'mbw-blockBtn',
                'data-action': 'move',
                title: t('action.move'),
                'aria-label': t('action.move'),
                onMouseDown: (event) => {
                  event.stopPropagation();
                  begin(event, 'move');
                }
              },
              h(IconMove, {})
            )
            : null,
          image
            ? h(
              'button',
              {
                type: 'button',
                className: 'mbw-blockBtn',
                'data-action': 'edit',
                title: t('action.editImage'),
                'aria-label': t('action.editImage'),
                onMouseDown: (event) => event.stopPropagation(),
                onClick: (event) => {
                  event.stopPropagation();
                  props.onEdit(item.id);
                }
              },
              h(IconEdit, {})
            )
            : null,
          image
            ? h(
              'button',
              {
                type: 'button',
                className: 'mbw-blockBtn',
                title: t('action.send'),
                'aria-label': t('action.send'),
                onMouseDown: (event) => event.stopPropagation(),
                onClick: (event) => {
                  event.stopPropagation();
                  props.onSend([item.id]);
                }
              },
              h(IconSend, {})
            )
            : null,
          image
            ? h(
              'button',
              {
                type: 'button',
                className: 'mbw-blockBtn',
                title: t('action.copyImage'),
                'aria-label': t('action.copyImage'),
                onMouseDown: (event) => event.stopPropagation(),
                onClick: (event) => {
                  event.stopPropagation();
                  void props.onCopyImage(item.id);
                }
              },
              h(IconCopy, {})
            )
            : h(
              'button',
              {
                type: 'button',
                className: 'mbw-blockBtn',
                title: t('action.copyText'),
                'aria-label': t('action.copyText'),
                onMouseDown: (event) => event.stopPropagation(),
                onClick: (event) => {
                  event.stopPropagation();
                  void props.onCopyText(item.id);
                }
              },
              h(IconCopy, {})
            ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-blockBtn',
              title: t('action.bringFront'),
              'aria-label': t('action.bringFront'),
              onMouseDown: (event) => event.stopPropagation(),
              onClick: (event) => {
                event.stopPropagation();
                props.onStack(item.id, 'front');
              }
            },
            h(IconFront, {})
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-blockBtn',
              title: t('action.delete'),
              'aria-label': t('action.delete'),
              onMouseDown: (event) => event.stopPropagation(),
              onClick: (event) => {
                event.stopPropagation();
                props.onDelete(item.id);
              }
            },
            h(IconTrash, {})
          )
        ),
        h('div', {
          className: 'mbw-handle',
          role: 'presentation',
          onMouseDown: (event) => begin(event, 'resize')
        })
      );
    }

    /** The right-click menu for one block. */
    function BlockMenu(props) {
      const { item, t, x, y, onClose } = props;
      const image = item.type === 'image';
      const entries = [
        image ? { id: 'edit', label: t('action.editImage'), icon: IconEdit, run: () => void props.onEdit(item.id) } : null,
        image
          ? { id: 'copy', label: t('action.copyImage'), icon: IconCopy, run: () => void props.onCopyImage(item.id) }
          : { id: 'copy', label: t('action.copyText'), icon: IconCopy, run: () => void props.onCopyText(item.id) },
        image ? { id: 'save', label: t('action.saveImage'), icon: IconDownload, run: () => void props.onDownload(item.id) } : null,
        image ? { id: 'send', label: t('action.send'), icon: IconSend, run: () => void props.onSend([item.id]) } : null,
        { id: 'front', label: t('action.bringFront'), icon: IconFront, run: () => props.onStack(item.id, 'front') },
        { id: 'back', label: t('action.sendBack'), icon: IconBack, run: () => props.onStack(item.id, 'back') },
        { id: 'delete', label: t('action.delete'), icon: IconTrash, danger: true, run: () => void props.onDelete(item.id) }
      ].filter(Boolean);
      useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') onClose();
        };
        const close = () => onClose();
        window.addEventListener('mousedown', close, { once: true });
        window.addEventListener('resize', close);
        document.addEventListener('keydown', onKey);
        return () => {
          window.removeEventListener('mousedown', close);
          window.removeEventListener('resize', close);
          document.removeEventListener('keydown', onKey);
        };
      }, [onClose]);
      const width = 150;
      const height = 8 + entries.length * 30;
      const left = clamp(x, 8, Math.max(8, window.innerWidth - width - 8));
      const top = clamp(y, 8, Math.max(8, window.innerHeight - height - 8));
      return h(
        'div',
        {
          className: 'mbw-menu',
          role: 'menu',
          style: { left: left + 'px', top: top + 'px' },
          onMouseDown: (event) => event.stopPropagation()
        },
        entries.map((entry) =>
          h(
            'button',
            {
              type: 'button',
              key: entry.id,
              className: 'mbw-menuItem',
              role: 'menuitem',
              'data-variant': entry.danger ? 'danger' : undefined,
              onClick: () => {
                entry.run();
                onClose();
              }
            },
            h(entry.icon, {}),
            h('span', {}, entry.label)
          )
        )
      );
    }

    /** The wall's body: toolbar, boards, canvas, and the preview. */
    function MoodboardBody(props) {
      const { t, sessionId, inputActions, getConversation } = props;
      const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      const [dragging, setDragging] = useState(false);
      const [newBoard, setNewBoard] = useState(false);
      const [selectedId, setSelectedId] = useState(null);
      const [menu, setMenu] = useState(null);
      /** `{ id, item, blob }` of the block open in the image editor, if any. */
      const [editing, setEditing] = useState(null);
      const [armed, setArmed] = useState(false);
      const rootRef = useRef(null);
      const fileRef = useRef(null);
      const stageRef = useRef(null);
      const canvasRef = useRef(null);
      /** The canvas' measured box, which bounds every block and sizes the stage. */
      const [viewport, setViewport] = useState({ width: 0, height: 0 });

      useEffect(() => {
        void loadWall();
      }, []);

      /** Track the canvas' box so blocks stay inside it and the stage grows to hold them. */
      useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null) return undefined;
        const measure = () => {
          setViewport((current) => {
            const width = Math.round(canvas.clientWidth);
            const height = Math.round(canvas.clientHeight);
            return current.width === width && current.height === height ? current : { width, height };
          });
        };
        measure();
        if (typeof ResizeObserver === 'undefined') {
          window.addEventListener('resize', measure);
          return () => window.removeEventListener('resize', measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(canvas);
        return () => observer.disconnect();
      }, []);

      /** The board new blocks land in. */
      const targetBoard = useCallback(() => {
        const active = snapshot.activeBoard;
        return active === ALL || active === INBOX ? '' : active;
      }, [snapshot.activeBoard]);

      /** Where in canvas space a pointer — or the viewport's top-left — stands. */
      const canvasPoint = useCallback((clientX, clientY) => {
        const stage = stageRef.current;
        const canvas = stageRef.current?.parentElement;
        if (stage === null || canvas === null) return { x: 16, y: 16 };
        const rect = stage.getBoundingClientRect();
        const px = clientX === undefined ? rect.left + 16 : clientX;
        const py = clientY === undefined ? rect.top + 16 : clientY;
        return {
          x: Math.max(0, Math.round(px - rect.left + canvas.scrollLeft)),
          y: Math.max(0, Math.round(py - rect.top + canvas.scrollTop))
        };
      }, []);

      /** Add files that arrived by paste, drop, or the file picker. */
      const accept = useCallback(async (files, at) => {
        const result = await addFiles(files, targetBoard(), at);
        if (result.added === 0 && result.images > 0) {
          notify(t('notice.limit', { limit: MAX_ITEMS }), 'error');
        }
      }, [t, targetBoard]);

      /** Pull images or text off the system clipboard, or point at the keyboard path when the browser refuses. */
      const paste = useCallback(async (at) => {
        const clipboard = navigator.clipboard;
        if (clipboard === undefined || (typeof clipboard.read !== 'function' && typeof clipboard.readText !== 'function')) {
          rootRef.current?.focus();
          notify(t('empty.hint'), 'info');
          return;
        }
        try {
          if (typeof clipboard.read === 'function') {
            const entries = await clipboard.read();
            const files = [];
            let textFromItem = '';
            for (const entry of entries) {
              const types = Array.isArray(entry.types) ? entry.types : (entry.type ? [entry.type] : []);
              for (const type of types) {
                if (type.startsWith('image/')) {
                  const blob = await entry.getType(type);
                  files.push(new File([blob], 'moodboard-paste-' + files.length + '.' + (IMAGE_EXTENSIONS[type] ?? 'png'), { type }));
                  break;
                } else if (type === 'text/plain' && !textFromItem) {
                  const blob = await entry.getType(type);
                  textFromItem = await blob.text();
                }
              }
            }
            if (files.length > 0) {
              await accept(files, at);
              return;
            }
            if (typeof textFromItem === 'string' && textFromItem.trim() !== '') {
              const id = await addText(targetBoard(), at, textFromItem);
              if (id !== undefined) setSelectedId(id);
              return;
            }
          }
          if (typeof clipboard.readText === 'function') {
            const text = await clipboard.readText();
            if (typeof text === 'string' && text.trim() !== '') {
              const id = await addText(targetBoard(), at, text);
              if (id !== undefined) setSelectedId(id);
              return;
            }
          }
          rootRef.current?.focus();
          notify(t('empty.hint'), 'info');
        } catch {
          rootRef.current?.focus();
          notify(t('empty.hint'), 'info');
        }
      }, [t, accept, targetBoard]);

      /** Put images into the current conversation's draft. */
      const send = useCallback(async (ids) => {
        try {
          const count = await sendToComposer(getConversation, inputActions, sessionId, ids);
          notify(count === 1 ? t('notice.sentOne') : t('notice.sent', { count }), 'success');
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          notify(SEND_FAILURES[reason] === undefined ? t('error.send', { message: reason }) : t(SEND_FAILURES[reason]), 'error');
        }
      }, [t, inputActions, sessionId, getConversation]);

      /** Save one image to the user's disk. */
      const download = useCallback(async (id) => {
        const item = snapshot.items.find((entry) => entry.id === id);
        if (item === undefined) return;
        const blob = await blobOf(id);
        if (blob === undefined) {
          notify(t('error.noImage'), 'error');
          return;
        }
        const extension = IMAGE_EXTENSIONS[blob.type || 'image/png'] ?? 'png';
        downloadBlob(blob, fileNameOf(item, extension));
      }, [snapshot.items, t]);

      /** Copy one image back onto the system clipboard. */
      const copyImage = useCallback(async (id) => {
        const item = snapshot.items.find((entry) => entry.id === id);
        const blob = await blobOf(id);
        if (item === undefined || blob === undefined) {
          notify(t('error.noImage'), 'error');
          return;
        }
        try {
          const type = blob.type || 'image/png';
          if (typeof ClipboardItem === 'undefined' || navigator.clipboard === undefined || typeof navigator.clipboard.write !== 'function') throw new Error('unsupported');
          await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
          notify(t('notice.copied'), 'success');
        } catch {
          const extension = IMAGE_EXTENSIONS[blob.type || 'image/png'] ?? 'png';
          downloadBlob(blob, fileNameOf(item, extension));
          notify(t('notice.copied'), 'info');
        }
      }, [snapshot.items, t]);

      /** Open one image block in the editor. */
      const openEditor = useCallback(async (id) => {
        const item = snapshot.items.find((entry) => entry.id === id);
        if (item === undefined || item.type !== 'image') return;
        const blob = await blobOf(id);
        if (blob === undefined) {
          notify(t('error.noImage'), 'error');
          return;
        }
        setEditing({ id, item, blob });
      }, [snapshot.items, t]);

      /** Close the editor without touching the block. */
      const closeEditor = useCallback(() => setEditing(null), []);

      /** Write the edited bytes back to the block that opened the editor. */
      const saveEdit = useCallback(async (blob) => {
        const target = editing;
        setEditing(null);
        if (target === null) return;
        await replaceImageBlob(target.id, blob);
        notify(t('notice.edited'), 'success');
      }, [editing, t]);

      /** Report one editor failure in the panel's notice row. */
      const reportEditError = useCallback((message) => {
        notify(message, 'error');
      }, []);

      /** Copy one text block's content. */
      const copyText = useCallback(async (id) => {        const item = snapshot.items.find((entry) => entry.id === id);
        if (item === undefined || item.content.trim() === '') return;
        try {
          if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(item.content);
            notify(t('notice.textCopied'), 'success');
            return;
          }
        } catch {
          /* fall through to the selection path */
        }
        const area = document.createElement('textarea');
        area.value = item.content;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand('copy');
          notify(t('notice.textCopied'), 'success');
        } catch {
          notify(t('error.storage', { message: 'clipboard' }), 'error');
        }
        area.remove();
      }, [snapshot.items, t]);

      /** Remove one block. */
      const remove = useCallback(async (id) => {
        await removeItem(id);
        setSelectedId((current) => (current === id ? null : current));
        notify(t('notice.deleted'), 'info');
      }, [t]);

      /** Clear the board in force, behind a two-step confirm that disarms itself. */
      const clear = useCallback(async () => {
        if (!armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        await clearBoard();
        notify(t('notice.cleared'), 'info');
      }, [armed, t]);

      /** Drop the clear confirmation after a while, so a stray first click is not a trap. */
      useEffect(() => {
        if (!armed) return undefined;
        const timer = window.setTimeout(() => setArmed(false), 4000);
        return () => window.clearTimeout(timer);
      }, [armed]);

      /** Export every image and text of the board in force. */
      const exportAll = useCallback(async () => {
        const items = visibleItems();
        if (items.length === 0) {
          notify(t('notice.exportEmpty'), 'info');
          return;
        }
        let count = 0;
        for (const item of items) {
          if (item.type !== 'image') continue;
          const blob = await blobOf(item.id);
          if (blob === undefined) continue;
          const extension = IMAGE_EXTENSIONS[blob.type || 'image/png'] ?? 'png';
          downloadBlob(blob, fileNameOf(item, extension));
          count += 1;
        }
        const texts = items.filter((item) => item.type === 'text' && item.content.trim() !== '');
        if (texts.length > 0) {
          const lines = texts.map((item) => '── ' + new Date(item.createTime).toLocaleString() + ' ──\n' + item.content);
          downloadBlob(new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8' }), 'moodboard-texts.txt');
          count += 1;
        }
        notify(t('notice.exported', { count }), 'success');
      }, [t]);

      /** Open the preview. */
      const open = useCallback((id) => {
        publish({ previewId: id });
      }, []);

      /** Close the preview. */
      const close = useCallback(() => {
        publish({ previewId: null });
      }, []);

      /** Commit one block's geometry or content. */
      const commit = useCallback((id, patch, persist) => {
        updateItem(id, patch, persist !== false);
      }, []);

      /** A click on empty canvas drops the selection. */
      const onCanvasMouseDown = useCallback((event) => {
        if (event.target.closest('[data-mbw-block]') !== null) return;
        setSelectedId(null);
      }, []);

      useEffect(() => {
        if (snapshot.previewId === null) return undefined;
        const onKey = (event) => {
          if (event.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
      }, [snapshot.previewId, close]);

      const preview = snapshot.previewId === null
        ? undefined
        : snapshot.items.find((item) => item.id === snapshot.previewId);

      const items = visibleItems();
      const boardName = snapshot.activeBoard === ALL
        ? t('board.all')
        : snapshot.activeBoard === INBOX
          ? t('board.inbox')
          : (snapshot.boards.find((board) => board.id === snapshot.activeBoard)?.name ?? t('board.untitled'));

      /** The bounds every block obeys: the canvas' own box, floored at the panel's width. */
      const limits = {
        width: Math.max(240, viewport.width),
        height: Math.max(240, viewport.height)
      };
      /** Grow the stage past the canvas' box so a block below the fold is reachable by scrolling. */
      const stageStyle = items.length === 0
        ? undefined
        : {
          minHeight: Math.max(limits.height, ...items.map((item) => item.y + item.height)) + 24 + 'px',
          width: Math.max(limits.width, ...items.map((item) => item.x + item.width)) + 24 + 'px',
          minWidth: '100%'
        };

      return h(
        'div',
        {
          className: 'mbw-root',
          ref: rootRef,
          tabIndex: 0,
          'data-mbw-wall': 'true',
          onPaste: (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
              return;
            }
            const files = [...(event.clipboardData?.items ?? [])]
              .filter((entry) => entry.kind === 'file' && entry.type.startsWith('image/'))
              .map((entry) => entry.getAsFile())
              .filter((file) => file !== null);
            if (files.length > 0) {
              event.preventDefault();
              void accept(files, canvasPoint(event.clientX, event.clientY));
              return;
            }
            const text = event.clipboardData?.getData('text/plain');
            if (typeof text === 'string' && text.trim() !== '') {
              event.preventDefault();
              void addText(targetBoard(), canvasPoint(event.clientX, event.clientY), text).then((id) => {
                if (id !== undefined) setSelectedId(id);
              });
            }
          },
          onDragOver: (event) => {
            event.preventDefault();
            setDragging(true);
          },
          onDragLeave: () => setDragging(false),
          onDrop: (event) => {
            event.preventDefault();
            setDragging(false);
            const files = [...(event.dataTransfer?.files ?? [])];
            if (files.length > 0) {
              void accept(files, canvasPoint(event.clientX, event.clientY));
              return;
            }
            const text = event.dataTransfer?.getData('text/plain');
            if (typeof text === 'string' && text.trim() !== '') {
              void addText(targetBoard(), canvasPoint(event.clientX, event.clientY), text).then((id) => {
                if (id !== undefined) setSelectedId(id);
              });
            }
          }
        },
        h(
          'div',
          { className: 'mbw-header' },
          h('span', { className: 'mbw-title' }, t('type.label')),
          h('span', { className: 'mbw-count' }, t('header.count', { count: snapshot.items.length })),
          h('span', { className: 'mbw-spacer' }),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              title: t('action.text'),
              onClick: () => void addText(targetBoard(), canvasPoint()).then((id) => {
                if (id !== undefined) setSelectedId(id);
              })
            },
            h(IconText, {}),
            h('span', {}, t('action.text'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              title: t('action.add'),
              onClick: () => fileRef.current?.click()
            },
            h(IconPlus, {}),
            h('span', {}, t('action.add'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              title: t('action.paste'),
              onClick: () => void paste(canvasPoint())
            },
            h('span', {}, t('action.paste'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              'data-variant': 'danger',
              'data-armed': String(armed),
              title: t('action.clear'),
              disabled: items.length === 0,
              onClick: () => void clear()
            },
            h(IconTrash, {}),
            h('span', {}, armed ? t('action.confirmClear') : t('action.clear'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              title: t('action.exportAll'),
              disabled: items.length === 0,
              onClick: () => void exportAll()
            },
            h(IconExport, {}),
            h('span', {}, t('action.exportAll'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              title: t('action.arrange'),
              disabled: items.length === 0,
              onClick: () => {
                arrangeVisible();
                notify(t('notice.arranged'), 'info');
              }
            },
            h(IconGrid, {}),
            h('span', {}, t('action.arrange'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              'data-active': String(snapshot.background === 'grid'),
              title: snapshot.background === 'grid' ? t('action.grid') : t('action.solid'),
              onClick: () => {
                const background = snapshot.background === 'grid' ? 'solid' : 'grid';
                writeLayout({ background, gridSize: snapshot.gridSize });
                publish({ background });
              }
            },
            h(IconGrid, {})
          ),
          h('input', {
            type: 'file',
            accept: 'image/*',
            multiple: true,
            ref: fileRef,
            hidden: true,
            onChange: (event) => {
              const files = [...(event.target.files ?? [])];
              event.target.value = '';
              if (files.length > 0) void accept(files, canvasPoint());
            }
          })
        ),
        h(
          'div',
          { className: 'mbw-boards' },
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-chip',
              'data-active': String(snapshot.activeBoard === ALL),
              onClick: () => publish({ activeBoard: ALL })
            },
            t('board.all')
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-chip',
              'data-active': String(snapshot.activeBoard === INBOX),
              onClick: () => publish({ activeBoard: INBOX })
            },
            t('board.inbox')
          ),
          snapshot.boards.map((board) =>
            h(
              'button',
              {
                type: 'button',
                key: board.id,
                className: 'mbw-chip',
                'data-active': String(snapshot.activeBoard === board.id),
                title: board.name,
                onClick: () => publish({ activeBoard: board.id }),
                onContextMenu: (event) => {
                  event.preventDefault();
                  notify(t('notice.boardRemoved'), 'info');
                  void removeBoard(board.id).catch((error) => {
                    notify(t('error.storage', { message: error instanceof Error ? error.message : String(error) }), 'error');
                  });
                }
              },
              board.name
            )
          ),
          newBoard
            ? h('input', {
              className: 'mbw-chipInput',
              autoFocus: true,
              placeholder: t('board.untitled'),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  createBoard(event.currentTarget.value);
                  setNewBoard(false);
                  notify(t('notice.boardCreated', { name: event.currentTarget.value.trim() }), 'success');
                } else if (event.key === 'Escape') {
                  setNewBoard(false);
                }
              },
              onBlur: (event) => {
                if (event.currentTarget.value.trim() !== '') createBoard(event.currentTarget.value);
                setNewBoard(false);
              }
            })
            : h(
              'button',
              {
                type: 'button',
                className: 'mbw-chip',
                title: t('action.newBoard'),
                onClick: () => setNewBoard(true)
              },
              h(IconPlus, { size: 11 }),
              h('span', {}, t('action.newBoard'))
            )
        ),
        snapshot.notice
          ? h('p', { className: 'mbw-notice', 'data-tone': snapshot.noticeTone }, snapshot.notice)
          : null,
        h(
          'div',
          {
            className: 'mbw-canvas',
            ref: canvasRef,
            'data-background': snapshot.background,
            'data-dragging': String(dragging),
            'data-mbw-canvas': 'true',
            role: 'application',
            'aria-label': t('canvas.label'),
            style: { '--mbw-grid-size': snapshot.gridSize + 'px' },
            onMouseDown: onCanvasMouseDown
          },
          h(
            'div',
            {
              ref: stageRef,
              className: 'mbw-stage',
              'data-mbw-stage': 'true',
              style: stageStyle
            },
            snapshot.status === 'loading'
              ? h('p', { className: 'mbw-empty' }, t('loading'))
              : snapshot.status === 'error'
                ? h('p', { className: 'mbw-empty' }, t('error.storage', { message: snapshot.error }))
                : items.length === 0
                  ? h(
                    'div',
                    { className: 'mbw-empty' },
                    h('span', { className: 'mbw-emptyTitle' }, t('empty.title')),
                    h('span', { className: 'mbw-emptyBody' }, t('empty.body')),
                    h('span', { className: 'mbw-emptyHint' }, t('empty.hint'))
                  )
                  : items.map((item) =>
                    h(Block, {
                      key: item.id,
                      item,
                      t,
                      selected: selectedId === item.id,
                      limits,
                      onSelect: setSelectedId,
                      onCommit: commit,
                      onOpenMenu: (id, x, y) => setMenu({ id, x, y }),
                      onPreview: open,
                      onSend: (ids) => void send(ids),
                      onDownload: (id) => void download(id),
                      onCopyImage: (id) => void copyImage(id),
                      onCopyText: (id) => void copyText(id),
                      onStack: (id, edge) => restack(id, edge),
                      onDelete: (id) => void remove(id),
                      onEdit: (id) => void openEditor(id)
                    })
                  )
          )
        ),
        menu === null
          ? null
          : (() => {
            const item = snapshot.items.find((entry) => entry.id === menu.id);
            if (item === undefined) return null;
            return h(BlockMenu, {
              item,
              t,
              x: menu.x,
              y: menu.y,
              onClose: () => setMenu(null),
              onEdit: (id) => void openEditor(id),
              onSend: (ids) => void send(ids),
              onDownload: (id) => void download(id),
              onCopyImage: (id) => void copyImage(id),
              onCopyText: (id) => void copyText(id),
              onStack: (id, edge) => restack(id, edge),
              onDelete: (id) => void remove(id)
            });
          })(),
        editing === null
          ? null
          : h(ImageEditor, {
            t,
            item: editing.item,
            blob: editing.blob,
            onError: reportEditError,
            onSave: (blob) => void saveEdit(blob),
            onClose: closeEditor
          }),
        preview === undefined
          ? null
          : h(
            'div',
            {
              className: 'mbw-lightbox',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': preview.title || t('action.preview'),
              onClick: (event) => {
                if (event.target === event.currentTarget) close();
              }
            },
            h(
              'div',
              { className: 'mbw-lightboxPanel' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'mbw-close',
                  'aria-label': t('action.close'),
                  onClick: close
                },
                h(IconClose, {})
              ),
              preview.url
                ? h('img', { className: 'mbw-lightboxImage', src: preview.url, alt: preview.title || '' })
                : null,
              h(
                'div',
                { className: 'mbw-lightboxRow' },
                h(
                  'label',
                  { className: 'mbw-field' },
                  h('span', { className: 'mbw-fieldLabel' }, t('field.title')),
                  h('input', {
                    className: 'mbw-input',
                    value: preview.title,
                    placeholder: t('field.title'),
                    onChange: (event) => updateItem(preview.id, { title: event.target.value })
                  })
                ),
                h(
                  'label',
                  { className: 'mbw-field' },
                  h('span', { className: 'mbw-fieldLabel' }, boardName),
                  h(
                    'select',
                    {
                      className: 'mbw-select',
                      value: preview.board,
                      onChange: (event) => updateItem(preview.id, { board: event.target.value })
                    },
                    h('option', { value: '' }, t('board.inbox')),
                    snapshot.boards.map((board) => h('option', { key: board.id, value: board.id }, board.name))
                  )
                )
              ),
              h(
                'div',
                { className: 'mbw-lightboxRow' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mbw-btn',
                    'data-variant': 'primary',
                    onClick: () => void send([preview.id])
                  },
                  h(IconSend, {}),
                  h('span', {}, t('action.send'))
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mbw-btn',
                    onClick: () => {
                      const id = preview.id;
                      close();
                      void openEditor(id);
                    }
                  },
                  h(IconEdit, {}),
                  h('span', {}, t('action.editImage'))
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mbw-btn',
                    onClick: () => void download(preview.id)
                  },
                  h(IconDownload, {}),
                  h('span', {}, t('action.download'))
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mbw-btn',
                    onClick: () => void copyImage(preview.id)
                  },
                  h(IconCopy, {}),
                  h('span', {}, t('action.copyImage'))
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'mbw-btn',
                    'data-variant': 'danger',
                    onClick: () => {
                      void remove(preview.id);
                      close();
                    }
                  },
                  h(IconTrash, {}),
                  h('span', {}, t('action.delete'))
                )
              )
            )
          )
      );
    }

    /** The tab chip's title. */
    function MoodboardTitle(props) {
      const { tab } = props.useTabInfo();
      return h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
        h(IconBoard, { size: 14 }),
        tab.title
      );
    }

    /** The guide card that opens this page. */
    function GuideArtwork() {
      return h(
        'svg',
        { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
        h('rect', { x: 2.5, y: 4.5, width: 13, height: 10, rx: 2, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M4.6 12.4l3.2-3.6 2.3 2.5 1.8-1.7 2.3 2.8z', fill: 'currentColor', opacity: 0.65 }),
        h('rect', { x: 8.5, y: 9.5, width: 13, height: 10, rx: 2, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', { d: 'M10.6 17.4l3.2-3.6 2.3 2.5 1.8-1.7 1.3 1.6z', fill: 'currentColor', opacity: 0.65 })
      );
    }

    /** The tab type's registry definition. */
    function moodboardDefinition(t) {
      return {
        id: PLUGIN_ID,
        kind: KIND,
        priority: 'extension',
        title: () => t('type.label'),
        guide: [
          {
            id: 'wall',
            order: 20,
            title: () => t('guide.title'),
            description: () => t('guide.description'),
            icon: GuideArtwork
          }
        ]
      };
    }

    /** Required browser services: the tab registry, the keyed seats, and copy. */
    const inject = ['slots', 'locale', 'sidebarRightTabs'];

    /** Client plugin body: the type, its dictionaries, its body, and its chip title. */
    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      ctx.effect(() => installStyles(), 'moodboard: styles');
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'moodboard: dictionaries');
      ctx.effect(() => ctx.sidebarRightTabs.register(moodboardDefinition(t)), 'moodboard: tab type');
      ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: PLUGIN_ID,
        locale: NS,
        inject: () => ({ getConversation: () => ctx.get('conversation') })
      }, MoodboardBody)), 'moodboard: tab body');
      ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
        name: 'sidebar.right.pane.tab.title',
        key: PLUGIN_ID
      }, MoodboardTitle)), 'moodboard: tab title');
      ctx.effect(() => () => {
        if (saveTimer !== 0) {
          window.clearTimeout(saveTimer);
          saveTimer = 0;
        }
        void flushSave();
        for (const url of wall.urls.values()) URL.revokeObjectURL(url);
        wall.urls.clear();
        wall.blobs.clear();
      }, 'moodboard: object urls');
    }

    return { inject, apply };
  }
});
