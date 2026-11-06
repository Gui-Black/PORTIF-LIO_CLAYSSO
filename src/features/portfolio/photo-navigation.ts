export function nextPhotoIndex(
  current: number,
  direction: number,
  total: number,
) {
  if (total <= 0) return 0
  return (((current + direction) % total) + total) % total
}

export function swipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const deltaX = endX - startX
  const deltaY = endY - startY
  if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.5)
    return 0
  return deltaX < 0 ? 1 : -1
}
