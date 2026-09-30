import { useEffect, useState, type CSSProperties } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DEVICES, IPHONE_ISSUES, OS_VERSIONS, SERVICES, SLOTS } from '../lib/data'
import { saveOrder, type Order } from '../lib/orders'
import { Img } from '../components/Img'
import { sendToSheet } from '../lib/sheet'
import { CONFIG } from '../config'

const schema = z.object({
  service: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  device: z.string().min(1, 'Chọn loại thiết bị'),
  brand: z.string().optional(),
  os: z.string().min(1, 'Chọn phiên bản hệ điều hành'),
  issueKind: z.string().optional(),
  issue: z.string().min(3, 'Nhập phần mềm cần cài hoặc lỗi gặp phải'),
  detail: z.string().min(10, 'Mô tả chi tiết hơn (ít nhất 10 ký tự)'),
  file: z.any().optional(),
  urgency: z.enum(['30m', 'today', 'schedule']),
  date: z.string().optional(),
  slot: z.string().optional(),
  method: z.enum(['remote', 'onsite']),
  name: z.string().min(2, 'Nhập họ và tên'),
  phone: z.string().regex(/^(0|\+?84)\d{9}$/, 'Số điện thoại chưa hợp lệ (VD: 0377339643)'),
  email: z.string().email('Email chưa hợp lệ'),
  terms: z.literal(true, { errorMap: () => ({ message: 'Bạn cần đồng ý điều khoản' }) }),
})
type Form = z.infer<typeof schema>

const STEP_FIELDS: (keyof Form)[][] = [
  ['service'], ['device', 'os', 'issue', 'detail'], ['urgency', 'method'], ['name', 'phone', 'email', 'terms'],
]
const TITLES = ['Chọn dịch vụ', 'Thông tin thiết bị', 'Mô tả & đặt lịch', 'Xác nhận']
const URGENCY = { '30m': 'Trong 30 phút', today: 'Trong hôm nay', schedule: 'Chọn giờ hẹn' } as const
const DRAFT = 'microtech.draft'

function estimate(service: string, device: string) {
  if (service === 'business' || device === 'Android' || device === 'iPhone') return null
  return service === 'it' || service === 'trouble' ? '50.000đ' : '50.000đ – 200.000đ'
}
const today = () => new Date().toISOString().slice(0, 10)

export default function Booking() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [step, setStep] = useState(params.get('service') ? 1 : 0)
  const [done, setDone] = useState<Order | null>(null)
  const [sheet, setSheet] = useState<'idle' | 'sent' | 'failed'>('idle')
  const [copied, setCopied] = useState(false)

  const f = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: (() => {
      let d: Partial<Form> = {}
      try { d = JSON.parse(sessionStorage.getItem(DRAFT) || '{}') } catch { /* ignore */ }
      return { urgency: 'today', method: 'remote', ...d, service: params.get('service') || d.service || '' } as Form
    })(),
  })
  const { register, watch, setValue, trigger, setError, handleSubmit, formState: { errors } } = f
  const v = watch()

  useEffect(() => { // autosave draft (without files) so a refresh never loses progress
    const sub = watch(({ file, ...rest }) => { try { sessionStorage.setItem(DRAFT, JSON.stringify(rest)) } catch { /* ignore */ } })
    return () => sub.unsubscribe()
  }, [watch])
  useEffect(() => { setValue('os', ''); setValue('issueKind', '') }, [v.device, setValue])

  const next = async () => {
    if (!(await trigger(STEP_FIELDS[step]))) return
    if (step === 2 && v.urgency === 'schedule' && (!v.date || !v.slot)) {
      setError('slot', { message: 'Chọn ngày và khung giờ hỗ trợ' }); return
    }
    setStep(step + 1)
  }

  const submit = handleSubmit((d) => {
    const svc = SERVICES.find((s) => s.id === d.service)?.title ?? d.service
    const file = (d.file as FileList | undefined)?.[0]
    const order = saveOrder({
      service: svc, device: d.device, os: d.os, issueKind: d.issueKind, brand: d.brand,
      issue: file ? `${d.issue}. ${d.detail} (đính kèm: ${file.name})` : `${d.issue}. ${d.detail}`,
      urgency: URGENCY[d.urgency], date: d.date, slot: d.slot,
      method: d.method === 'remote' ? 'Hỗ trợ từ xa' : 'Hỗ trợ tại chỗ',
      name: d.name, phone: d.phone, email: d.email, price: estimate(d.service, d.device) ?? undefined,
    })
    sessionStorage.removeItem(DRAFT)
    setDone(order)
    if (CONFIG.sheetScriptUrl) sendToSheet(CONFIG.sheetScriptUrl, order).then((ok) => setSheet(ok ? 'sent' : 'failed'))
  })

  if (done) return (
    <section className="wrap page narrow center success">
      <svg className="okmark" viewBox="0 0 92 92" aria-hidden><circle cx="46" cy="46" r="44" /><path d="M26 48l14 14 28-30" /></svg>
      <h1>Đặt lịch thành công!</h1>
      <p className="muted">MicroTech sẽ xem xét và xác nhận yêu cầu của bạn trong thời gian sớm nhất.</p>
      <div className="code" role="status"><small>Mã đơn hỗ trợ</small><b>{done.code}</b>
        <button className="link" onClick={() => { navigator.clipboard?.writeText(done.code); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>{copied ? 'Đã sao chép ✓' : 'Sao chép'}</button></div>
      <dl className="summary">
        <dt>Dịch vụ</dt><dd>{done.service}</dd>
        <dt>Thiết bị</dt><dd>{done.device} · {done.os}</dd>
        <dt>Thời gian</dt><dd>{done.date ? `${done.date.split('-').reverse().join('/')} · ${done.slot}` : done.urgency}</dd>
        <dt>Mô tả lỗi</dt><dd>{done.issue}</dd>
      </dl>
      {sheet !== 'idle' && <p className={'sync ' + sheet} role="status">{sheet === 'sent' ? 'Đã ghi yêu cầu vào Google Sheet' : 'Chưa ghi được vào Google Sheet – đơn vẫn được lưu'}</p>}
      {CONFIG.showSheetOnSuccess && CONFIG.sheetUrl && <p><a href={CONFIG.sheetUrl} target="_blank" rel="noopener noreferrer">Mở Google Sheet</a></p>}
      <button className="btn btn-lg" onClick={() => nav(`/track?code=${done.code}&phone=${done.phone}`)}>XEM CHI TIẾT ĐƠN</button>
      <Link to="/" className="btn btn-ghost btn-lg">VỀ TRANG CHỦ</Link>
    </section>
  )

  const err = (k: keyof Form) => errors[k] && <p className="err" role="alert">{String(errors[k]?.message)}</p>
  const price = estimate(v.service, v.device)

  return (
    <section className="wrap page narrow">
      <h1>Đặt lịch hỗ trợ</h1>
      <p className="muted">Chỉ 4 bước để nhận hỗ trợ nhanh chóng. Không cần tạo tài khoản.</p>
      <ol className="stepper" aria-label="Tiến trình" style={{ '--p': step / 3 } as CSSProperties}>
        {TITLES.map((t, i) => <li key={t} className={i === step ? 'on' : i < step ? 'ok' : ''} aria-current={i === step}><i>{i < step ? '✓' : i + 1}</i><span>{t}</span></li>)}
      </ol>

      <form onSubmit={submit} noValidate className="form">
        {step === 0 && (
          <fieldset className="slide" key="s0"><legend>1. Chọn dịch vụ bạn cần hỗ trợ</legend>
            {SERVICES.map((s) => (
              <label key={s.id} className={'opt' + (v.service === s.id ? ' sel' : '')}>
                <input type="radio" value={s.id} {...register('service')} />
                <Img k={s.img} className="opt-ico" /><span><b>{s.title}</b><small>{s.desc}</small></span>
              </label>))}
            {err('service')}
          </fieldset>)}

        {step === 1 && (
          <fieldset className="slide"><legend>2. Thông tin thiết bị & sự cố</legend>
            <div className="seg" role="radiogroup" aria-label="Loại thiết bị">
              {DEVICES.map((d) => <label key={d} className={v.device === d ? 'sel' : ''}><input type="radio" value={d} {...register('device')} />{d}</label>)}
            </div>
            {err('device')}
            {v.device && (<>
              <label>Phiên bản hệ điều hành
                <select {...register('os')}><option value="">Chọn phiên bản</option>{OS_VERSIONS[v.device].map((o) => <option key={o}>{o}</option>)}</select></label>{err('os')}
              {v.device === 'iPhone' && <label>Vấn đề liên quan đến
                <select {...register('issueKind')}><option value="">Chọn</option>{IPHONE_ISSUES.map((o) => <option key={o}>{o}</option>)}</select></label>}
              <label>Hãng / model thiết bị (không bắt buộc)<input {...register('brand')} placeholder="VD: Dell XPS 13" /></label>
            </>)}
            <label>Phần mềm cần cài hoặc lỗi gặp phải<input {...register('issue')} placeholder="VD: Cài Office 2021 / Lỗi 0x80070005" /></label>{err('issue')}
            <label>Mô tả chi tiết<textarea rows={4} {...register('detail')} placeholder="Mô tả chi tiết tình trạng lỗi của bạn…" /></label>{err('detail')}
          </fieldset>)}

        {step === 2 && (
          <fieldset className="slide"><legend>3. Ảnh lỗi & lịch hỗ trợ</legend>
            <label>Ảnh hoặc video lỗi (không bắt buộc)
              <input type="file" accept="image/jpeg,image/png,video/mp4" {...register('file')} /><small>JPG, PNG, MP4 (tối đa 5MB)</small></label>
            <div className="seg" role="radiogroup" aria-label="Mức độ khẩn cấp">
              {(Object.keys(URGENCY) as (keyof typeof URGENCY)[]).map((k) => <label key={k} className={v.urgency === k ? 'sel' : ''}><input type="radio" value={k} {...register('urgency')} />{URGENCY[k]}</label>)}
            </div>
            {v.urgency === 'schedule' && (<>
              <label>Ngày hỗ trợ<input type="date" min={today()} {...register('date')} /></label>
              <div className="slots" role="radiogroup" aria-label="Khung giờ">
                {SLOTS.map((s) => <label key={s} className={v.slot === s ? 'sel' : ''}><input type="radio" value={s} {...register('slot')} />{s}</label>)}
              </div>{err('slot')}
            </>)}
            <div className="seg" role="radiogroup" aria-label="Hình thức hỗ trợ">
              <label className={v.method === 'remote' ? 'sel' : ''}><input type="radio" value="remote" {...register('method')} />Hỗ trợ từ xa</label>
              <label className={v.method === 'onsite' ? 'sel' : ''}><input type="radio" value="onsite" {...register('method')} />Hỗ trợ tại chỗ</label>
            </div>
          </fieldset>)}

        {step === 3 && (
          <fieldset className="slide"><legend>4. Xác nhận thông tin</legend>
            <label>Họ và tên<input autoComplete="name" {...register('name')} /></label>{err('name')}
            <label>Số điện thoại<input type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} /></label>{err('phone')}
            <label>Email nhận xác nhận<input type="email" autoComplete="email" {...register('email')} /></label>{err('email')}
            <dl className="summary">
              <dt>Dịch vụ</dt><dd>{SERVICES.find((s) => s.id === v.service)?.title}</dd>
              <dt>Thiết bị</dt><dd>{v.device} · {v.os}</dd>
              <dt>Thời gian</dt><dd>{v.urgency === 'schedule' ? `${v.date} · ${v.slot}` : URGENCY[v.urgency]}</dd>
              <dt>Giá dự kiến</dt><dd>{price ?? 'Báo giá sau khi xem xét sự cố.'}</dd>
            </dl>
            <label className="check"><input type="checkbox" {...register('terms')} /> Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật.</label>{err('terms')}
          </fieldset>)}

        <div className="actions">
          {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>Quay lại</button>}
          {step < 3
            ? <button type="button" className="btn" onClick={next}>Tiếp tục ›</button>
            : <button type="submit" className="btn">GỬI YÊU CẦU HỖ TRỢ</button>}
        </div>
      </form>
    </section>
  )
}
