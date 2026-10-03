import { Link } from 'react-router-dom'
import { SERVICES } from '../lib/data'
import { usePreferences } from '../lib/preferences'
import type { Review, ReviewSummary } from '../lib/reviews'
import { useReviews } from '../hooks/useReviews'
import { Icon } from './Icon'

export function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  const { tr } = usePreferences()
  const spokenRating = Number(rating.toFixed(1))
  return <span className="review-stars" role="img" aria-label={tr(`${spokenRating} trên 5 sao`, `${spokenRating} out of 5 stars`)}>
    {[1, 2, 3, 4, 5].map((star) => <span className="review-star" key={star} style={{ width: size, height: size }} aria-hidden="true"><Icon name="star" width={size} height={size} /><span style={{ width: `${Math.max(0, Math.min(1, rating - star + 1)) * 100}%` }}><Icon name="star" width={size} height={size} /></span></span>)}
  </span>
}

export function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const { tr, language } = usePreferences()
  const average = new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(summary.average)
  return <div className="review-summary glass">
    <div className="review-score"><span className="eyebrow">{tr('ĐÁNH GIÁ DỊCH VỤ', 'SERVICE RATINGS')}</span><strong>{summary.count ? average : '—'}<small>/ 5</small></strong><Stars rating={summary.average} size={24} /><p className="muted">{summary.count ? tr(`${summary.count} đánh giá đã được duyệt`, `${summary.count} published ${summary.count === 1 ? 'review' : 'reviews'}`) : tr('Chưa có đánh giá được công khai', 'No published reviews yet')}</p></div>
    <div className="review-distribution">{[5, 4, 3, 2, 1].map((rating) => <div key={rating} className="review-bar-row"><span>{rating}<Icon name="star" width={13} height={13} /></span><meter min="0" max={summary.count || 1} value={summary.distribution[rating - 1]} aria-label={tr(`${rating} sao: ${summary.distribution[rating - 1]} đánh giá`, `${rating} stars: ${summary.distribution[rating - 1]} reviews`)} /><span>{summary.distribution[rating - 1]}</span></div>)}</div>
  </div>
}

export function ReviewCard({ review }: { review: Review }) {
  const { tr, language } = usePreferences()
  const service = SERVICES.find((s) => s.id === review.service)
  const initial = Array.from(review.name)[0]?.toLocaleUpperCase() || 'M'
  return <article className="review-card glass">
    <div className="review-card-top"><span className="review-avatar" aria-hidden="true">{initial}</span><div><h3>{review.name}</h3><time dateTime={new Date(review.createdAt).toISOString()}>{new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(review.createdAt)}</time></div><Icon name="quote" className="review-quote" width={26} height={26} /></div>
    <Stars rating={review.rating} /><span className="review-service">{service ? tr(service.title, service.titleEn) : review.service}</span>
    <p className="review-comment">{review.comment}</p>
    <span className="review-approved"><Icon name="check" width={14} height={14} />{tr('Đánh giá đã được duyệt', 'Published review')}</span>
  </article>
}

export function ReviewState({ loading, failed, empty, onRetry }: { loading: boolean; failed: boolean; empty: boolean; onRetry: () => void }) {
  const { tr } = usePreferences()
  if (loading) return <div className="review-skeletons" aria-label={tr('Đang tải đánh giá', 'Loading reviews')} aria-busy="true">{[0, 1, 2].map((i) => <div className="glass review-skeleton" key={i} />)}</div>
  if (failed) return <div className="review-empty glass" role="status"><Icon name="message" width={32} height={32} /><h3>{tr('Chưa tải được đánh giá', 'Reviews are unavailable right now')}</h3><p>{tr('Vui lòng thử lại sau ít phút.', 'Please try again in a few minutes.')}</p><button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>{tr('Thử lại', 'Try again')}</button></div>
  if (empty) return <div className="review-empty glass"><Icon name="message" width={34} height={34} /><h3>{tr('Mỗi trải nghiệm đều đáng được lắng nghe.', 'Every experience deserves to be heard.')}</h3><p>{tr('Chưa có đánh giá phù hợp. Hãy chia sẻ trải nghiệm sau khi sử dụng dịch vụ MicroTech.', 'No matching reviews yet. Share your experience after using MicroTech.')}</p></div>
  return null
}

export function ReviewsPreview() {
  const { tr, language } = usePreferences()
  const { data, loading, failed, reload } = useReviews('', '', 3)
  return <section id="reviews" className="reviews-section"><div className="wrap">
    <div className="reviews-heading"><div><span className="eyebrow">{tr('TRẢI NGHIỆM TỪ KHÁCH HÀNG', 'CUSTOMER EXPERIENCES')}</span><h2>{tr('Bạn đánh giá, MicroTech lắng nghe.', 'Your feedback helps us improve.')}</h2><p className="muted">{tr('Những nhận xét sau mỗi lần hỗ trợ giúp chúng tôi làm tốt hơn.', 'Feedback after each support session helps us do better.')}</p></div><Link to="/reviews#write-review" className="btn btn-ghost"><Icon name="edit" />{tr('Viết đánh giá', 'Write a review')}</Link></div>
    {!loading && !failed && data.summary.count > 0 && <div className="review-preview-score"><Stars rating={data.summary.average} /><b>{new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(data.summary.average)} / 5</b><span>{tr(`${data.summary.count} đánh giá`, `${data.summary.count} reviews`)}</span></div>}
    <ReviewState loading={loading} failed={failed} empty={!data.reviews.length} onRetry={reload} />
    <div className="review-grid">{data.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
    <div className="reviews-footer"><Link to="/reviews" className="btn btn-ghost">{tr('Xem tất cả đánh giá', 'View all reviews')}<Icon name="arrow" /></Link></div>
  </div></section>
}
