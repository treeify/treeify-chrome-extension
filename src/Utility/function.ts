export function call<T>(f: () => T): T {
  return f()
}
