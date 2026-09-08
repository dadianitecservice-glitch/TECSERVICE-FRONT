type CarouselControlsProps = {
  onPrevious: () => void
  onNext: () => void
  label: string
}

export function CarouselControls({ onPrevious, onNext, label }: CarouselControlsProps) {
  return (
    <div className="carousel-controls" aria-label={label}>
      <button className="carousel-arrow" type="button" onClick={onPrevious} aria-label="წინა">
        <img src="/assets/icons/carousel-left.svg" alt="" />
      </button>
      <button className="carousel-arrow" type="button" onClick={onNext} aria-label="შემდეგი">
        <img src="/assets/icons/carousel-right.svg" alt="" />
      </button>
    </div>
  )
}
