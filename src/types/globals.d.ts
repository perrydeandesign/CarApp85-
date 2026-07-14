// Ambient declarations for runtime globals that exist at runtime (RN Hermes /
// Node test env) but aren't in the configured TS libs.
//
// - `atob` is provided by Hermes/JSC at runtime; not in the RN lib set.
// - `Buffer` is the Node fallback used only when `atob` is absent (jest).

declare function atob(data: string): string;

declare const Buffer: {
  from(data: string, encoding: string): { toString(encoding: string): string };
};
