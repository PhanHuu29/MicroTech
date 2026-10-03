import { useState } from 'react'
import { SERVICES } from '../lib/data'
import { usePreferences } from '../lib/preferences'
import { useReviews } from '../hooks/useReviews'
import { RatingSummary, ReviewCard, ReviewState } from '../components/Reviews'
import { ReviewForm } from '../components/ReviewForm'
import { Icon } from '../components/Icon'

export default function Reviews() {
  const { tr } = usePreferences()
  const [service, setService] = useState('')
  const [rating, setRating] = useState('')
  const [revision, setRevision] = useState(0)
  const { data, loading, failed, moreLoading, more, reload } = useReviews(service, rating, 6, revision)
  return <section className="wrap page review-page">
    <div className="review-page-head"><div><span className="eyebrow">{tr('KHÁCH HÀNG NÓI GÌ?', 'CUSTOMER FEEDBACK')}</span><h1>{tr('Đánh giá dịch vụ MicroTech', 'MicroTech service reviews')}</h1><p className="muted">{tr('Một lời nhận xét nhỏ. Một bước cải thiện lớn.', 'A little feedback. A better experience for everyone.')}</p></div><a className="btn btn-ghost" href="#write-review"><Icon name="edit" />{tr('Viết đánh giá', 'Write a review')}</a></div>
    <div className="reviews-layout"><div className="reviews-main">
      {!loading && !failed && <RatingSummary summary={data.summary} />}
      <div className="review-list-head"><h2>{tr('Trải nghiệm khách hàng', 'Customer experiences')}</h2><span className="muted">{!loading && !failed && tr(`${data.total} đánh giá`, `${data.total} reviews`)}</span></div>
      <div className="review-filters"><label>{tr('Dịch vụ', 'Service')}<select value={service} onChange={(e) => setService(e.target.value)}><option value="">{tr('Tất cả dịch vụ', 'All services')}</option>{SERVICES.map((s) => <option key={s.id} value={s.id}>{tr(s.title, s.titleEn)}</option>)}</select></label><label>{tr('Số sao', 'Rating')}<select value={rating} onChange={(e) => setRating(e.target.value)}><option value="">{tr('Tất cả mức sao', 'All ratings')}</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{tr(`${n} sao`, `${n} stars`)}</option>)}</select></label></div>
      <div aria-live="polite"><ReviewState loading={loading} failed={failed && !data.reviews.length} empty={!data.reviews.length} onRetry={reload} /></div>
      <div className="review-grid">{data.reviews.map((review) => <ReviewCard review={review} key={review.id} />)}</div>
      {failed && data.reviews.length > 0 && <p className="err" role="status">{tr('Chưa tải thêm được đánh giá. Vui lòng thử lại.', 'Could not load more reviews. Please try again.')}</p>}
      {data.nextOffset !== null && <div className="reviews-footer"><button type="button" className="btn btn-ghost" disabled={moreLoading || loading} onClick={() => void more()}>{moreLoading ? tr('Đang tải…', 'Loading…') : tr('Xem thêm đánh giá', 'Load more reviews')}<Icon name="arrow" /></button></div>}
    </div><ReviewForm onSubmitted={() => setRevision((n) => n + 1)} /></div>
  </section>
}
