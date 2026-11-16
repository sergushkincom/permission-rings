import { register } from 'node:module'

// The library imports './panel-data' without an extension. Next resolves that;
// Node's test runner does not. The hook rewrites those specifiers to '.ts'.
register('./resolve-ts.mjs', import.meta.url)
