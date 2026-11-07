export async function fetchAllRows<T>(
  query: (
    start: number,
    end: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let start = 0; ; start += 500) {
    const result = await query(start, start + 499)
    if (result.error || !result.data)
      throw new Error('Falha ao consultar os registros.')
    rows.push(...result.data)
    if (result.data.length < 500) return rows
  }
}
