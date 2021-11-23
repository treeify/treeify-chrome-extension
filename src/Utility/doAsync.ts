export async function doAsync<T>(f: () => Promise<T>): Promise<T> {
  return await f()
}
