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

    /** Browser-local storage for the wall's image records. */
    const DB_NAME = 'dsh-moodboard-wall';
    const DB_VERSION = 1;
    const STORE = 'items';
    /** Browser-local storage for the board list. */
    const BOARDS_KEY = 'dsh.moodboard.boards.v1';
    /** The pseudo board that shows every item. */
    const ALL = 'all';
    /** The pseudo board that shows items without a board. */
    const INBOX = 'inbox';
    /** A wall this size stays comfortably inside a browser tab's memory. */
    const MAX_ITEMS = 300;

    /** Simplified Chinese dictionary. */
    const zh = {
      'type.label': '灵感墙',
      'guide.title': '灵感墙',
      'guide.description': '收集截图与设计素材，随时送进会话',
      'header.count': '{count} 张',
      'action.add': '添加图片',
      'action.paste': '粘贴',
      'action.download': '下载',
      'action.delete': '删除',
      'action.send': '发送到会话',
      'action.clear': '清空',
      'action.close': '关闭',
      'action.newBoard': '新建分组',
      'action.rename': '重命名',
      'action.preview': '预览',
      'action.removeBoard': '删除分组',
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
      'notice.sent': '已把 {count} 张图片放进输入框。',
      'notice.sentOne': '已把图片放进输入框。',
      'notice.deleted': '已从灵感墙移除。',
      'notice.cleared': '已清空当前分组。',
      'notice.boardCreated': '已新建分组「{name}」。',
      'notice.boardRemoved': '已删除分组，里面的图片移到了「未分类」。',
      'notice.renamed': '已重命名。',
      'notice.copied': '已复制图片到剪贴板。',
      'notice.limit': '灵感墙最多保留 {limit} 张图片，请先删除一些。'
    };
    /** English dictionary, checked against the Chinese key set. */
    const en = {
      'type.label': 'Moodboard',
      'guide.title': 'Moodboard',
      'guide.description': 'Collect screenshots and design material, and send them into the chat',
      'header.count': '{count}',
      'action.add': 'Add images',
      'action.paste': 'Paste',
      'action.download': 'Download',
      'action.delete': 'Delete',
      'action.send': 'Send to chat',
      'action.clear': 'Clear',
      'action.close': 'Close',
      'action.newBoard': 'New board',
      'action.rename': 'Rename',
      'action.preview': 'Preview',
      'action.removeBoard': 'Remove board',
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
      'notice.sent': 'Added {count} images to the composer.',
      'notice.sentOne': 'Added the image to the composer.',
      'notice.deleted': 'Removed from the wall.',
      'notice.cleared': 'Cleared this board.',
      'notice.boardCreated': 'Created the board "{name}".',
      'notice.boardRemoved': 'Removed the board; its images are now unfiled.',
      'notice.renamed': 'Renamed.',
      'notice.copied': 'Copied the image to the clipboard.',
      'notice.limit': 'The wall keeps at most {limit} images; remove some first.'
    };

    /** The style block this package owns, installed once per page. */
    const STYLE_ID = 'dsh-moodboard-wall/moodboard.css';
    const CSS = [
      '.mbw-root{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:1.5;background:var(--dsw-specific-sidebar-fill,transparent);outline:none}',
      '.mbw-header{display:flex;align-items:center;gap:8px;flex:none;padding:8px 12px;border-bottom:.5px solid var(--dsw-alias-border-l2)}',
      '.mbw-title{font-weight:600;font-size:13px;white-space:nowrap}',
      '.mbw-count{color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}',
      '.mbw-spacer{flex:1 1 auto;min-width:0}',
      '.mbw-btn{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 8px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}',
      '.mbw-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-btn:disabled{opacity:.45;cursor:default}',
      '.mbw-btn[data-variant="primary"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.mbw-btn[data-variant="primary"]:hover:not(:disabled){background:var(--dsw-alias-brand-primary);color:#fff}',
      '.mbw-btn[data-variant="danger"]:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}',
      '.mbw-btn svg{width:13px;height:13px;flex:none}',
      '.mbw-boards{display:flex;align-items:center;gap:6px;flex:none;padding:8px 12px;overflow-x:auto;border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.mbw-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis}',
      '.mbw-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.mbw-chip[data-active="true"]{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}',
      '.mbw-chipInput{height:24px;width:110px;padding:0 8px;border-radius:999px;border:.5px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}',
      '.mbw-body{flex:1 1 auto;min-height:0;overflow:auto;padding:10px 12px 16px}',
      '.mbw-body[data-dragging="true"]{outline:1px dashed var(--dsw-alias-brand-primary);outline-offset:-6px}',
      '.mbw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}',
      '.mbw-tile{position:relative;border-radius:var(--dsw-radius-md,8px);overflow:hidden;background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l1)}',
      '.mbw-tile:hover{border-color:var(--dsw-alias-border-l2)}',
      '.mbw-tile:focus-within{border-color:var(--dsw-alias-brand-primary)}',
      '.mbw-thumbButton{display:block;width:100%;padding:0;border:0;background:transparent;cursor:zoom-in;aspect-ratio:1/1}',
      '.mbw-thumb{width:100%;height:100%;object-fit:cover;display:block;background:var(--dsw-alias-bg-layer-2)}',
      '.mbw-thumbPlaceholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;aspect-ratio:1/1;color:var(--dsw-alias-label-secondary)}',
      '.mbw-tileTitle{position:absolute;left:0;right:0;bottom:0;padding:10px 6px 4px;font-size:11px;color:#fff;background:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,0));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;text-align:left}',
      '.mbw-tileBar{position:absolute;top:4px;right:4px;display:flex;gap:2px;opacity:0;transition:opacity .12s ease}',
      '.mbw-tile:hover .mbw-tileBar,.mbw-tile:focus-within .mbw-tileBar{opacity:1}',
      '.mbw-tileBtn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:rgba(0,0,0,.55);color:#fff;cursor:pointer}',
      '.mbw-tileBtn:hover{background:rgba(0,0,0,.75)}',
      '.mbw-tileBtn svg{width:13px;height:13px}',
      '.mbw-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;height:100%;min-height:120px;text-align:center;color:var(--dsw-alias-label-secondary);padding:0 18px}',
      '.mbw-emptyTitle{color:var(--dsw-alias-label-primary);font-size:13px}',
      '.mbw-emptyBody{font-size:12px;max-width:280px}',
      '.mbw-emptyHint{font-size:11px;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}',
      '.mbw-notice{margin:0 12px 8px;padding:6px 8px;border-radius:var(--dsw-radius-sm,6px);font-size:11px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}',
      '.mbw-notice[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}',
      '.mbw-notice[data-tone="success"]{color:var(--dsw-alias-state-success-primary)}',
      '.mbw-lightbox{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.62)}',
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
      '.mbw-close svg{width:14px;height:14px}'
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

    /** Open (and migrate) the browser database that keeps the wall's images. */
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

    /** Remove every record of one board, or every record when no board is named. */
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

    /** A new board identity. */
    function newId(prefix) {
      const random = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      return prefix + '-' + random;
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
        editing: false
      },
      listeners: new Set(),
      urls: new Map(),
      sending: false
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
            items.push({ ...meta, url });
          } else {
            items.push(meta);
          }
        }
        items.sort((left, right) => right.createdAt - left.createdAt);
        publish({ status: 'ready', items, boards: readBoards(), error: '' });
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

    /** Add image files to the wall. */
    async function addFiles(files, board) {
      const images = [...files].filter((file) => isImageFile(file));
      if (images.length === 0) return { added: 0, images: 0 };
      const room = MAX_ITEMS - wall.snapshot.items.length;
      if (room <= 0) return { added: 0, images: images.length };
      const accepted = images.slice(0, room);
      const created = [];
      for (const file of accepted) {
        const id = newId('img');
        const size = await readImageSize(file);
        const record = {
          id,
          blob: file,
          type: file.type || 'image/png',
          size: file.size,
          width: size.width,
          height: size.height,
          board: board ?? '',
          title: typeof file.name === 'string' ? file.name : '',
          note: '',
          createdAt: Date.now()
        };
        await writeRecord(record);
        const url = URL.createObjectURL(file);
        wall.urls.set(id, url);
        const { blob, ...meta } = record;
        created.push({ ...meta, url });
      }
      publish({ items: [...created, ...wall.snapshot.items] });
      return { added: created.length, images: images.length };
    }

    /** Remove one item from the wall. */
    async function removeItem(id) {
      const url = wall.urls.get(id);
      if (url !== undefined) {
        URL.revokeObjectURL(url);
        wall.urls.delete(id);
      }
      await removeRecord(id);
      publish({
        items: wall.snapshot.items.filter((item) => item.id !== id),
        previewId: wall.snapshot.previewId === id ? null : wall.snapshot.previewId
      });
    }

    /** Update one item's metadata. */
    function updateItem(id, patch) {
      const item = wall.snapshot.items.find((entry) => entry.id === id);
      if (item === undefined) return;
      const next = { ...item, ...patch };
      publish({ items: wall.snapshot.items.map((entry) => (entry.id === id ? next : entry)) });
      readAllRecords()
        .then((records) => {
          const found = records.find((entry) => entry.id === id);
          if (found !== undefined) writeRecord({ ...found, ...patch });
        })
        .catch(() => {});
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
      }
      await removeRecords(items.map((item) => item.id));
      publish({ items: wall.snapshot.items.filter((item) => !items.some((removed) => removed.id === item.id)) });
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

    /** Remove a board; its images become unfiled. */
    async function removeBoard(id) {
      const boards = wall.snapshot.boards.filter((board) => board.id !== id);
      writeBoards(boards);
      publish({
        boards,
        activeBoard: wall.snapshot.activeBoard === id ? ALL : wall.snapshot.activeBoard,
        items: wall.snapshot.items.map((item) => (item.board === id ? { ...item, board: '' } : item))
      });
      const records = await readAllRecords();
      const moved = records.filter((record) => record.board === id);
      if (moved.length === 0) return;
      await withStore('readwrite', (store) => {
        for (const record of moved) store.put({ ...record, board: '' });
      });
    }

    /** The blob of one item, read back from storage. */
    async function blobOf(id) {
      const records = await readAllRecords();
      const record = records.find((entry) => entry.id === id);
      if (record === undefined || !(record.blob instanceof Blob)) return undefined;
      return record.blob;
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
      const drafts = conversation.createDrafts(sessionId, files);
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
    const IconBoard = glyph([
      h('rect', { x: '2.2', y: '3', width: '8', height: '6.4', rx: 1.2, stroke: 'currentColor', strokeWidth: 1.2 }),
      h('rect', { x: '6.4', y: '6.6', width: '7.4', height: '6.4', rx: 1.2, stroke: 'currentColor', strokeWidth: 1.2 })
    ]);

    /** One tile of the wall. */
    function Tile(props) {
      const { item, t } = props;
      return h(
        'div',
        { className: 'mbw-tile', 'data-mbw-item': item.id },
        h(
          'button',
          {
            type: 'button',
            className: 'mbw-thumbButton',
            'aria-label': item.title || t('action.preview'),
            onClick: () => props.onOpen(item.id)
          },
          item.url
            ? h('img', { className: 'mbw-thumb', src: item.url, alt: item.title || '' })
            : h('span', { className: 'mbw-thumbPlaceholder' }, h(IconBoard, { size: 20 }))
        ),
        h(
          'div',
          { className: 'mbw-tileBar' },
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-tileBtn',
              title: t('action.send'),
              'aria-label': t('action.send'),
              onClick: (event) => {
                event.stopPropagation();
                props.onSend([item.id]);
              }
            },
            h(IconSend, {})
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-tileBtn',
              title: t('action.download'),
              'aria-label': t('action.download'),
              onClick: (event) => {
                event.stopPropagation();
                props.onDownload(item.id);
              }
            },
            h(IconDownload, {})
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-tileBtn',
              title: t('action.delete'),
              'aria-label': t('action.delete'),
              onClick: (event) => {
                event.stopPropagation();
                props.onDelete(item.id);
              }
            },
            h(IconTrash, {})
          )
        ),
        item.title ? h('span', { className: 'mbw-tileTitle' }, item.title) : null
      );
    }

    /** The wall's body: header, boards, grid, and the lightbox. */
    function MoodboardBody(props) {
      const { t, sessionId, inputActions, getConversation } = props;
      const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      const [dragging, setDragging] = useState(false);
      const [newBoard, setNewBoard] = useState(false);
      const rootRef = useRef(null);
      const fileRef = useRef(null);
      const lightboxRef = useRef(null);

      useEffect(() => {
        void loadWall();
      }, []);

      /** The board new images land in. */
      const targetBoard = useCallback(() => {
        const active = snapshot.activeBoard;
        return active === ALL || active === INBOX ? '' : active;
      }, [snapshot.activeBoard]);

      /** Add files that arrived by paste, drop, or the file picker. */
      const accept = useCallback(async (files) => {
        const result = await addFiles(files, targetBoard());
        if (result.added === 0 && result.images > 0) {
          notify(t('notice.limit', { limit: MAX_ITEMS }), 'error');
        }
      }, [t, targetBoard]);

      /** Pull images off the system clipboard, or point at the keyboard path when the browser refuses. */
      const paste = useCallback(async () => {
        const clipboard = navigator.clipboard;
        if (clipboard === undefined || typeof clipboard.read !== 'function') {
          rootRef.current?.focus();
          notify(t('empty.hint'), 'info');
          return;
        }
        try {
          const entries = await clipboard.read();
          const files = [];
          for (const entry of entries) {
            if (typeof entry.type !== 'string' || !entry.type.startsWith('image/')) continue;
            const blob = await entry.getType(entry.type);
            files.push(new File([blob], 'moodboard-paste-' + files.length + '.' + (IMAGE_EXTENSIONS[entry.type] ?? 'png'), { type: entry.type }));
          }
          if (files.length === 0) {
            rootRef.current?.focus();
            notify(t('empty.hint'), 'info');
            return;
          }
          await accept(files);
        } catch {
          rootRef.current?.focus();
          notify(t('empty.hint'), 'info');
        }
      }, [t, accept]);

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
        if (blob === undefined) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = item.title || 'moodboard-' + id;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, [snapshot.items]);

      /** Remove one image. */
      const remove = useCallback(async (id) => {
        await removeItem(id);
        notify(t('notice.deleted'), 'info');
      }, [t]);

      /** Clear the board in force. */
      const clear = useCallback(async () => {
        await clearBoard();
        notify(t('notice.cleared'), 'info');
      }, [t]);

      /** Open the preview. */
      const open = useCallback((id) => {
        publish({ previewId: id });
      }, []);

      /** Close the preview. */
      const close = useCallback(() => {
        publish({ previewId: null });
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

      return h(
        'div',
        {
          className: 'mbw-root',
          ref: rootRef,
          tabIndex: 0,
          'data-mbw-wall': 'true',
          onPaste: (event) => {
            const files = [...(event.clipboardData?.items ?? [])]
              .filter((entry) => entry.kind === 'file' && entry.type.startsWith('image/'))
              .map((entry) => entry.getAsFile())
              .filter((file) => file !== null);
            if (files.length === 0) return;
            event.preventDefault();
            void accept(files);
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
            if (files.length > 0) void accept(files);
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
              onClick: () => void paste()
            },
            h('span', {}, t('action.paste'))
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'mbw-btn',
              'data-variant': 'danger',
              title: t('action.clear'),
              disabled: items.length === 0,
              onClick: () => void clear()
            },
            h('span', {}, t('action.clear'))
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
              if (files.length > 0) void accept(files);
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
          { className: 'mbw-body', 'data-dragging': String(dragging) },
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
                : h(
                  'div',
                  { className: 'mbw-grid' },
                  items.map((item) =>
                    h(Tile, {
                      key: item.id,
                      item,
                      t,
                      onOpen: open,
                      onSend: (ids) => void send(ids),
                      onDelete: (id) => void remove(id),
                      onDownload: (id) => void download(id)
                    })
                  )
                )
        ),
        preview === undefined
          ? null
          : h(
            'div',
            {
              className: 'mbw-lightbox',
              ref: lightboxRef,
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
        for (const url of wall.urls.values()) URL.revokeObjectURL(url);
        wall.urls.clear();
      }, 'moodboard: object urls');
    }

    return { inject, apply };
  }
});
