// Module resolution hook for connector replay: 'pg' → pg_replay.mjs; everything else untouched.
const target = new URL('./pg_replay.mjs', import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'pg') return { url: target, shortCircuit: true };
  return nextResolve(specifier, context);
}
