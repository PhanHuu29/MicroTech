import { useRef, useState, type FormEvent } from 'react'
import { SERVICES } from '../lib/data'
import { createReview, submitReview, type ReviewSubmission } from '../lib/reviews'
import { usePreferences } from '../lib/preferences'
import { Icon } from './Icon'

const PENDING_KEY = 'microtech.review.pending'
function pendingReview(): ReviewSubmission | null {
  try {
    const d = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null') as ReviewSubmission | null
    return d && d.action === 'review' && typeof d.id === 'string' && typeof d.receipt === 'string' && typeof d.name === 'string' && typeof d.comment === 'string' && typeof d.service === 'string' && Number.isInteger(d.rating) && d.rating >= 1 && d.rating <= 5 && d.consent === true ? d : null
  } catch { return null }
}

export function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { tr } = usePreferences()
  const attempt = useRef<ReviewSubmission | null>(pendingReview())
  const [name, setName] = useState(attempt.current?.name || '')
  const [service, setService] = useState(attempt.current?.service || '')
  const [rating, setRating] = useState(attempt.current?.rating || 0)
  const [comment, setComment] = useState(attempt.current?.comment || '')
  const [consent, setConsent] = useState(!!attempt.current)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ratingError, setRatingError] = useState(false)
  const sending = useRef(false)
  const ratingRef = useRef<HTMLInputElement>(null)
  const labels = [tr('Rất không hài lòng', 'Very dissatisfied'), tr('Chưa hài lòng', 'Dissatisfied'), tr('Bình thường', 'Okay'), tr('Hài lòng', 'Satisfied'), tr('Rất hài lòng', 'Very satisfied')]
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending.current) return
    if (!rating) { setRatingError(true); ratingRef.current?.focus(); return }
    if (!event.currentTarget.reportValidity()) return
    if (name.trim().length < 2 || comment.trim().length < 10) { setFailed(true); return }
    const input = { name: name.trim(), service, rating, comment: comment.trim(), consent: true as const }
    const previous = attempt.current
    const same = previous && previous.name === input.name && previous.service === input.service && previous.rating === input.rating && previous.comment === input.comment
    const review = same ? previous : createReview(input)
    attempt.current = review
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(review)) } catch { /* a retry still uses the same ID in this session */ }
    sending.current = true; setBusy(true); setFailed(false)
    try {
      await submitReview(review)
      setSent(true); onSubmitted()
      try { sessionStorage.removeItem(PENDING_KEY) } catch { /* optional persistence */ }
      attempt.current = null
    } catch { setFailed(true) }
    finally { sending.current = false; setBusy(false) }
  }
  if (sent) return <section className="review-form glass review-thanks" id="write-review" role="status" tabIndex={-1}>
    <span className="review-thanks-icon"><Icon name="check" width={30} height={30} /></span><h2>{tr('Cảm ơn bạn đã chia sẻ!', 'Thank you for your feedback!')}</h2><p>{tr('Đánh giá đã được lưu và đang chờ duyệt. Nhận xét sẽ xuất hiện sau khi MicroTech kiểm tra nội dung.', 'Your review has been saved and is awaiting moderation. It will appear after MicroTech checks the content.')}</p><small>{tr('Trải nghiệm của bạn giúp chúng tôi cải thiện chất lượng hỗ trợ.', 'Your experience helps us improve our support.')}</small>
  </section>
  return <section className="review-form glass" id="write-review" aria-labelledby="review-form-heading">
    <span className="eyebrow">{tr('CHIA SẺ TRẢI NGHIỆM', 'SHARE YOUR EXPERIENCE')}</span><h2 id="review-form-heading">{tr('Bạn hài lòng đến đâu?', 'How was your experience?')}</h2><p className="muted">{tr('Đánh giá dịch vụ sau khi được MicroTech hỗ trợ.', 'Rate the service after receiving support from MicroTech.')}</p>
    <form className="form" onSubmit={submit}>
      <fieldset className="review-rating" disabled={busy}><legend>{tr('Chất lượng dịch vụ', 'Service quality')} <span aria-hidden="true">*</span></legend><div className="rating-choices">{[1, 2, 3, 4, 5].map((value) => <label key={value} className={`rating-choice${value <= rating ? ' selected' : ''}`} title={labels[value - 1]}><input ref={value === 1 ? ratingRef : undefined} className="sr" type="radio" name="review-rating" value={value} checked={rating === value} onChange={() => { setRating(value); setRatingError(false) }} aria-label={tr(`${value} sao — ${labels[value - 1]}`, `${value} stars — ${labels[value - 1]}`)} aria-describedby="rating-label" /><Icon name="star" width={34} height={34} /><span>{value}</span></label>)}</div><span id="rating-label" className="rating-label">{rating ? labels[rating - 1] : tr('Chọn từ 1 đến 5 sao', 'Choose 1 to 5 stars')}</span>{ratingError && <p className="err" role="alert">{tr('Vui lòng chọn số sao.', 'Please choose a rating.')}</p>}</fieldset>
      <label>{tr('Tên hiển thị', 'Display name')} *<input value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={60} required disabled={busy} autoComplete="nickname" placeholder={tr('VD: Minh Anh', 'e.g. Alex')} aria-describedby="review-name-hint" /><small id="review-name-hint">{tr('Tên này sẽ hiển thị cùng đánh giá của bạn.', 'This name will appear with your review.')}</small></label>
      <label>{tr('Dịch vụ đã sử dụng', 'Service used')} *<select value={service} onChange={(e) => setService(e.target.value)} required disabled={busy}><option value="">{tr('Chọn dịch vụ', 'Select a service')}</option>{SERVICES.map((s) => <option key={s.id} value={s.id}>{tr(s.title, s.titleEn)}</option>)}</select></label>
      <label>{tr('Nhận xét của bạn', 'Your feedback')} *<textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5} minLength={10} maxLength={1200} required disabled={busy} placeholder={tr('Bạn thấy điều gì tốt? MicroTech có thể cải thiện điều gì?', 'What went well? What could MicroTech improve?')} aria-describedby="review-comment-hint" /><small id="review-comment-hint" className="review-character-count">{tr('Tối thiểu 10 ký tự', 'At least 10 characters')}<span>{comment.length} / 1200</span></small></label>
      <label className="check review-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required disabled={busy} /><span>{tr('Tôi đồng ý công khai tên hiển thị, số sao, dịch vụ và nhận xét sau khi được duyệt.', 'I agree to publish my display name, rating, service and feedback after moderation.')}</span></label>
      {failed && <p className="err" role="alert">{tr('Chưa xác nhận được đánh giá. Kiểm tra nội dung và thử gửi lại; nội dung bạn nhập vẫn được giữ.', 'We could not confirm your review. Check your feedback and try again; your text has been kept.')}</p>}
      <button className="btn btn-lg" type="submit" disabled={busy} aria-busy={busy}><Icon name="send" />{busy ? tr('Đang lưu đánh giá…', 'Saving your review…') : failed ? tr('Thử gửi lại', 'Try sending again') : tr('Gửi đánh giá', 'Submit review')}</button>
      <small className="review-moderation-note"><Icon name="shield" width={15} height={15} />{tr('Mọi mức sao đều có thể được công khai. Nội dung được kiểm tra trước khi hiển thị.', 'Reviews of every rating can be published. Content is checked before it appears.')}</small>
    </form>
  </section>
}
