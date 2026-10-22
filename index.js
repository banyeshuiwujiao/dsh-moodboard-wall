/**
 * Host half of the 灵感墙 / 截图中转箱 bundle.
 *
 * The wall is a browser-local surface: the images live in the user's own browser
 * storage (IndexedDB), and the panel is drawn in the right sidebar of the Web UI
 * through the client half in `client.js`. Nothing about the wall is model-facing
 * and nothing needs the Host, so this half owns no state and registers no tool.
 *
 * It exists so the bundle ships one Cordis row: the Web client mounts the client
 * half of the same package, and the plugin appears in the plugin inventory with
 * its own localized title, description, and icon.
 */
export function apply() {}
