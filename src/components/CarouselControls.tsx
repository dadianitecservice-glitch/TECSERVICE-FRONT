import { useTranslation } from '../i18n/LocaleProvider'
type CarouselControlsProps = {
  onPrevious: () => void
  onNext: () => void
  label: string
}

export function CarouselControls({ onPrevious, onNext, label }: CarouselControlsProps) {
  const l10n = useTranslation()
  return (
    <div className="carousel-controls" aria-label={l10n.t(label)}>
      <button className="carousel-arrow" type="button" onClick={onPrevious} aria-label={l10n.t("წინა")}>
        <img src="/assets/icons/carousel-left.svg" alt="" />
      </button>
      <button className="carousel-arrow" type="button" onClick={onNext} aria-label={l10n.t("შემდეგი")}>
        <img src="/assets/icons/carousel-right.svg" alt="" />
      </button>
    </div>
  )
}
