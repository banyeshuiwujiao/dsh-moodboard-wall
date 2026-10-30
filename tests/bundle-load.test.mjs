/**
 * Load the wall's client bundle the way the DSH web shell does, and check the
 * pieces the image editor added: the bundle still registers, both copy
 * dictionaries carry the same keys, and the editor's own keys are present.
 *
 * The shell installs `window.__ModuleLoader__` and hands the bundle a `require`
 * that resolves the platform module table; this harness supplies a minimal
 * React stub plus a `locale` / `slots` / `sidebarRightTabs` service.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientPath = path.join(here, '..', 'client.js');

/** Minimal React stub: the plugin only calls createElement and the hooks. */
function createReactStub() {
  const React = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }),
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useRef: (initial) => ({ current: initial }),
    useCallback: (fn) => fn,
    useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot()
  };
  return React;
}

/** Minimal document: the plugin installs one stylesheet and reads nodes off it. */
function createDocumentStub() {
  const head = { children: [], appendChild(node) { this.children.push(node); } };
  return {
    head,
    body: { appendChild() {} },
    createElement: (tag) => ({ tagName: tag, dataset: {}, style: {}, children: [], remove() {} }),
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

/** Drive the bundle exactly as the browser does. */
function loadBundle() {
  const React = createReactStub();
  const documentStub = createDocumentStub();
  const dictionaries = [];
  const effects = [];
  const registered = [];
  const pendingInjections = [];

  const ctx = {
    get: () => ({ createDrafts: () => [], releaseDraftAttachments: () => {} }),
    effect: (fn) => {
      effects.push(fn);
      const disposer = fn();
      return { dispose: () => { if (typeof disposer === 'function') disposer(); } };
    },
    locale: {
      bind: () => (key, params) => {
        const dictionary = dictionaries[0] ?? {};
        const template = dictionary[key] ?? key;
        if (params === undefined) return template;
        return template.replace(/\{(\w+)\}/g, (_m, name) => String(params[name] ?? ''));
      },
      register: (_ns, bundle) => {
        dictionaries.push(bundle.zh, bundle.en);
        return { dispose() {} };
      }
    },
    slots: {
      inject: (_name, factory) => {
        pendingInjections.push(factory);
        return { dispose() {} };
      },
      register: (definition) => {
        registered.push(definition);
        return { dispose() {} };
      }
    },
    sidebarRightTabs: {
      register: (definition) => {
        registered.push({ tabType: definition.id });
        return { dispose() {} };
      }
    }
  };

  const registrations = [];
  const windowStub = {
    __ModuleLoader__: {
      load(registration) {
        registrations.push(registration);
      }
    }
  };

  const source = readFileSync(clientPath, 'utf8');
  const loader = new Function('window', 'document', `${source}\nreturn window.__ModuleLoader__;`)(windowStub, documentStub);

  assert.equal(typeof loader, 'object', 'the bundle must register through __ModuleLoader__');
  assert.equal(registrations.length, 1, 'exactly one bundle registration');
  const registration = registrations[0];
  assert.equal(registration.id, 'dsh-moodboard-wall', 'bundle id');

  const module = registration.factory((specifier) => {
    if (specifier === 'react') return React;
    throw new Error(`unexpected require: ${specifier}`);
  });

  assert.equal(typeof module.apply, 'function', 'the plugin body must expose apply');
  module.apply(ctx);
  assert.ok(effects.length > 0, 'apply must register effects');
  for (const factory of pendingInjections) factory();

  return { dictionaries, registered };
}

const { dictionaries, registered } = loadBundle();

assert.equal(dictionaries.length, 2, 'zh and en are both registered');
const [zh, en] = dictionaries;

// A key present in one language only renders its own name in the other.
const zhKeys = Object.keys(zh).sort();
const enKeys = Object.keys(en).sort();
const missingInEn = zhKeys.filter((key) => !(key in en));
const missingInZh = enKeys.filter((key) => !(key in zh));
assert.deepEqual(missingInEn, [], `keys missing from the English dictionary: ${missingInEn.join(', ')}`);
assert.deepEqual(missingInZh, [], `keys missing from the Chinese dictionary: ${missingInZh.join(', ')}`);

// The image editor's own copy must exist in both languages.
const editorKeys = [
  'action.editImage',
  'edit.title', 'edit.tab.annotate', 'edit.tab.resize', 'edit.tab.format',
  'edit.tool.rect', 'edit.tool.ellipse', 'edit.tool.arrow', 'edit.tool.pen',
  'edit.tool.mosaic', 'edit.tool.text',
  'edit.color', 'edit.weight', 'edit.undo', 'edit.clearMarks',
  'edit.width', 'edit.height', 'edit.lockAspect', 'edit.original',
  'edit.format', 'edit.quality', 'edit.textPlaceholder',
  'edit.save', 'edit.cancel', 'edit.result',
  'notice.edited', 'error.edit'
];
for (const key of editorKeys) {
  assert.ok(key in zh, `the Chinese dictionary is missing ${key}`);
  assert.ok(key in en, `the English dictionary is missing ${key}`);
}

// The tab body must still register under the right seat.
const body = registered.find((entry) => entry.name === 'sidebar.right.pane.tab');
assert.ok(body, 'the wall must register its sidebar tab body');
assert.equal(body.key, 'dsh-moodboard-wall', 'tab body key');

// The editing engine functions must exist as real declarations.
const source = readFileSync(clientPath, 'utf8');
for (const name of ['replaceImageBlob', 'renderEditorOps', 'encodeCanvas', 'paintOp', 'ImageEditor']) {
  assert.ok(
    new RegExp(`function ${name}\\b`).test(source),
    `the editor engine is missing ${name}`
  );
}

// The editor must keep pointer capture failures contained, like the annotator.
assert.ok(
  /try\s*\{\s*canvas\.setPointerCapture/.test(source),
  'setPointerCapture must be wrapped in a try/catch'
);

// A pasted image's block must offer the edit action.
assert.ok(
  /'data-action': 'edit'/.test(source) || /"data-action": "edit"/.test(source),
  'the image block bar must carry the edit action'
);

// Format must initialize from the existing blob's type if available, not hardcoded to png.
assert.ok(
  /initialFormat\s*=\s*blob/.test(source),
  'ImageEditor format must initialize from blob.type'
);

// fileNameOf must strip existing image extensions to prevent foo.png.jpg.
assert.ok(
  /base\.replace\(\/\\\.\(png\|jpe\?g\|gif\|webp\|bmp\|avif\|svg\)\$\/i,\s*''\)/.test(source),
  'fileNameOf must strip existing extension before appending new one'
);

console.log('wall bundle registers and mounts its tab body.');
console.log(`copy keys: ${zhKeys.length} in each language, no gaps.`);
console.log(`editor keys checked: ${editorKeys.length}`);
console.log('editor engine functions present; pointer capture contained; edit action wired.');
console.log('format initialization and extension sanitization verified.');
