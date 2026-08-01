import PhotoCard from './PhotoCard'
import SkeletonGrid from './SkeletonGrid'

export default function PhotoGrid({ photos, loading, onDelete }) {
  if (loading) return <SkeletonGrid count={12} />

  if (!photos?.length) return null

  return (
    <div className="photo-grid">
      {photos.map((photo, i) => (
        <PhotoCard key={photo.id || i} photo={photo} index={i} onDelete={onDelete} allPhotos={photos} />
      ))}
    </div>
  )
}
