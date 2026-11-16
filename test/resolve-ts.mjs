const HAS_EXTENSION = /\.(?:[cm]?[jt]sx?|json|node|wasm)$/

export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
  if (isRelative && !HAS_EXTENSION.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context)
    } catch {
      // Not a TypeScript file; resolve the original specifier below.
    }
  }
  return nextResolve(specifier, context)
}
