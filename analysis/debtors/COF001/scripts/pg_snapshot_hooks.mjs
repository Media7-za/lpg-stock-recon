// Module resolve hook: point the generator's `import pg from 'pg'` at the offline snapshot stub.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'pg') {
    return { url: new URL('./pg_snapshot_stub.mjs', import.meta.url).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
