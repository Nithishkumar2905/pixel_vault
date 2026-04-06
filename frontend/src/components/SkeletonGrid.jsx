export default function SkeletonGrid({ count = 8 }) {
  const heights = [250, 320, 200, 280, 350, 230, 300, 260, 190, 340, 270, 310]

  return (
    <div className="photo-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton photo-grid-item"
          style={{
            height: heights[i % heights.length],
            borderRadius: 16,
          }}
        />
      ))}
    </div>
  )
}
