export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}
