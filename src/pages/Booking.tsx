import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DEVICES, IPHONE_ISSUES, OS_VERSIONS, SERVICES, SLOTS, URGENCY, METHODS } from '../lib/data'
import { loadOrders, saveOrder, orderService, orderUrgency, orderMethod, type Order } from '../lib/orders'
import { Img } from '../components/Img'
import { Icon } from '../components/Icon'
import { isSheetUrl, sendToSheet, type SheetResult } from '../lib/sheet'
import { CONFIG } from '../config'
import { usePreferences } from '../lib/preferences'

const MESSAGES = {
  service: ['Vui lòng chọn dịch vụ', 'Please select a service'],
  device: ['Chọn loại thiết bị', 'Please select a device'],
  os: ['Chọn phiên bản hệ điều hành', 'Please select an OS version'],
  issue: ['Nhập phần mềm cần cài hoặc lỗi gặp phải', 'Describe the software or issue'],
  detail: ['Mô tả chi tiết hơn (ít nhất 10 ký tự)', 'Please add more detail (at least 10 characters)'],
  name: ['Nhập họ và tên', 'Please enter your full name'],
  phone: ['Số điện thoại chưa hợp lệ (VD: 0377339643)', 'Enter a valid Vietnamese phone number (e.g. 0377339643)'],
  email: ['Email chưa hợp lệ', 'Enter a valid email address'],
  terms: ['Bạn cần đồng ý điều khoản', 'Please agree to the service terms'],
  schedule: ['Chọn ngày và khung giờ hỗ trợ', 'Please select a date and time slot'],
  pastDate: ['Chọn ngày từ hôm nay trở đi', 'Please choose today or a future date'],
  fileSize: ['Tệp phải nhỏ hơn hoặc bằng 5 MB', 'The file must be 5 MB or smaller'],
  fileType: ['Chỉ chấp nhận JPG, PNG hoặc MP4', 'Choose a JPG, PNG or MP4 file'],
  tooLong: ['Nội dung quá dài, vui lòng rút gọn', 'This entry is too long. Please shorten it.'],
} as const
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
const schema = z.object({
  service: z.string().refine((id) => SERVICES.some((s) => s.id === id), 'service'),
  device: z.string().refine((id) => (DEVICES as readonly string[]).includes(id), 'device'),
  brand: z.string().max(120, 'tooLong').optional(),
  os: z.string().min(1, 'os').max(100, 'tooLong'),
  issueKind: z.string().max(120, 'tooLong').optional(),
  issue: z.string().trim().min(3, 'issue').max(300, 'tooLong'),
  detail: z.string().trim().min(10, 'detail').max(3000, 'tooLong'),
  file: z.any().optional().refine((files) => !files?.[0] || files[0].size <= 5 * 1024 * 1024, 'fileSize').refine((files) => !files?.[0] || ['image/jpeg', 'image/png', 'video/mp4'].includes(files[0].type), 'fileType'),
  urgency: z.enum(['30m', 'today', 'schedule']),
  date: z.string().optional(), slot: z.string().optional(),
  method: z.enum(['remote', 'onsite']),
  name: z.string().trim().min(2, 'name').max(100, 'tooLong'),
  phone: z.string().transform((value) => value.replace(/[\s().-]/g, '')).pipe(z.string().regex(/^(0|\+?84)\d{9}$/, 'phone')),
  email: z.string().trim().email('email').max(200, 'tooLong'),
  terms: z.boolean().refine((value) => value, 'terms'),
}).superRefine((value, context) => {
  if (value.urgency !== 'schedule') return
  if (!value.date || !value.slot || !SLOTS.includes(value.slot)) context.addIssue({ code: z.ZodIssueCode.custom, path: ['slot'], message: 'schedule' })
  if (value.date && (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || value.date < today())) context.addIssue({ code: z.ZodIssueCode.custom, path: ['date'], message: 'pastDate' })
})
type Form = z.infer<typeof schema>
const STEP_FIELDS: (keyof Form)[][] = [
  ['service'], ['device', 'os', 'brand', 'issueKind', 'issue', 'detail'], ['urgency', 'method', 'date', 'slot', 'file'], ['name', 'phone', 'email', 'terms'],
]
const DRAFT = 'microtech.draft'
function estimate(service: string, device: string) {
  if (service === 'business' || device === 'Android' || device === 'iPhone') return null
  return service === 'it' || service === 'trouble' ? '50.000đ' : '50.000đ – 200.000đ'
}

export default function Booking() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const { tr, language } = usePreferences()
  const selected = SERVICES.some((service) => service.id === params.get('service')) ? params.get('service')! : ''
  const [step, setStep] = useState(selected ? 1 : 0)
  const [done, setDone] = useState<Order | null>(null)
  const [sheet, setSheet] = useState<SheetResult | 'idle' | 'sending'>('idle')
  const [localSaved, setLocalSaved] = useState(true)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const moving = useRef(false)
  const submitted = useRef(false)
  const sending = useRef(false)
  const stepRef = useRef<HTMLFieldSetElement>(null)
  const timer = useRef<number>()
  const titles = [tr('Chọn dịch vụ', 'Choose a service'), tr('Thông tin thiết bị', 'Device details'), tr('Chọn lịch', 'Schedule'), tr('Xác nhận', 'Confirm')]
  const f = useForm<Form>({
    resolver: zodResolver(schema), mode: 'onTouched',
    defaultValues: (() => {
      let draft: Partial<Form> = {}
      try {
        const value = JSON.parse(sessionStorage.getItem(DRAFT) || '{}')
        if (value && typeof value === 'object' && !Array.isArray(value)) draft = value
      } catch { /* no draft */ }
      return {
        device: '', os: '', issue: '', detail: '', brand: '', issueKind: '', name: '', phone: '', email: '', date: '', slot: '',
        urgency: 'today', method: 'remote', ...draft, service: selected || draft.service || '', terms: false,
      } as Form
    })(),
  })
  const { register, watch, setValue, trigger, handleSubmit, formState: { errors, isSubmitting } } = f
  const v = watch()
  const previousDevice = useRef(v.device)
  useEffect(() => {
    const subscription = watch(({ file, terms, ...rest }) => {
      try { sessionStorage.setItem(DRAFT, JSON.stringify(rest)) } catch { /* unavailable storage */ }
    })
    return () => subscription.unsubscribe()
  }, [watch])
  useEffect(() => {
    if (previousDevice.current === v.device) return
    previousDevice.current = v.device
    setValue('os', ''); setValue('issueKind', '')
  }, [v.device, setValue])
  useEffect(() => {
    stepRef.current?.focus({ preventScroll: true })
  }, [step])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const next = async () => {
    if (moving.current) return
    moving.current = true
    try { if (await trigger(STEP_FIELDS[step], { shouldFocus: true })) setStep((old) => Math.min(old + 1, 3)) }
    finally { moving.current = false }
  }
  const sync = async (order: Order) => {
    if (!CONFIG.sheetScriptUrl || sending.current) return
    sending.current = true
    setSheet('sending')
    try { setSheet(await sendToSheet(CONFIG.sheetScriptUrl, order)) }
    finally { sending.current = false }
  }
  const submit = handleSubmit(async (data) => {
    if (submitted.current) return
    submitted.current = true
    const service = SERVICES.find((item) => item.id === data.service)!
    const file = (data.file as FileList | undefined)?.[0]
    const order = saveOrder({
      service: service.title, serviceId: service.id, device: data.device, os: data.os, issueKind: data.issueKind, brand: data.brand,
      issue: `${data.issue}. ${data.detail}${file ? ` (đính kèm: ${file.name})` : ''}`,
      urgency: URGENCY[data.urgency][0], urgencyId: data.urgency,
      date: data.urgency === 'schedule' ? data.date : undefined, slot: data.urgency === 'schedule' ? data.slot : undefined,
      method: METHODS[data.method][0], methodId: data.method,
      name: data.name, phone: data.phone, email: data.email, price: estimate(data.service, data.device) ?? undefined,
    })
    try { sessionStorage.removeItem(DRAFT) } catch { /* ignore */ }
    setLocalSaved(loadOrders().some((saved) => saved.code === order.code))
    setDone(order)
    await sync(order)
  })
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step < 3) { event.preventDefault(); void next() }
    else void submit(event)
  }
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(done!.code)
      setCopyError(false); setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch { setCopyError(true) }
  }
  const dateLabel = (order: Order) => order.date ? `${new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB').format(new Date(`${order.date}T12:00:00`))} · ${order.slot}` : orderUrgency(order, tr)
  if (done) return <section className="wrap page narrow center success">
    <div className="booking-card glass">
      <div className="okmark" aria-hidden="true"><Icon name="check" width="42" height="42" /></div>
      <h1>{tr('Đã tạo yêu cầu hỗ trợ!', 'Your support request is ready!')}</h1>
      <p className="muted">{tr(`${CONFIG.brand} sẽ xác nhận lịch qua Zalo hoặc điện thoại. Hãy giữ mã đơn bên dưới.`, `${CONFIG.brand} will confirm your appointment via Zalo or phone. Keep your request code below.`)}</p>
      <div className="code" role="status"><small>{tr('Mã đơn hỗ trợ', 'Support request code')}</small><b>{done.code}</b><button type="button" className="link" onClick={copy}>{copied ? tr('Đã sao chép ✓', 'Copied ✓') : tr('Sao chép mã', 'Copy code')}</button></div>
      {copyError && <p className="err" role="alert">{tr('Hãy chọn mã phía trên để sao chép thủ công.', 'Select the code above to copy it manually.')}</p>}
      <dl className="summary">
        <dt>{tr('Dịch vụ', 'Service')}</dt><dd>{orderService(done, tr)}</dd>
        <dt>{tr('Thiết bị', 'Device')}</dt><dd>{done.device} · {done.os === 'Khác' ? tr('Khác', 'Other') : done.os}</dd>
        <dt>{tr('Thời gian', 'When')}</dt><dd>{dateLabel(done)}</dd>
        <dt>{tr('Hình thức', 'Support method')}</dt><dd>{orderMethod(done, tr)}</dd>
        <dt>{tr('Mô tả lỗi', 'Issue')}</dt><dd>{done.issue}</dd>
      </dl>
      <div aria-live="polite">
        {sheet === 'sending' && <p className="sync sending">{tr('Đang gửi yêu cầu…', 'Sending your request…')}</p>}
        {sheet === 'sent' && <p className="sync sent">{tr('Yêu cầu đã được gửi đi. Lịch hỗ trợ sẽ được xác nhận riêng.', 'Your request has been sent. Your appointment will be confirmed separately.')}</p>}
        {(sheet === 'failed' || sheet === 'invalid') && <div className="sync failed"><p>{tr('Chưa gửi được yêu cầu. Hãy thử lại hoặc liên hệ qua Zalo/hotline với mã đơn này.', 'Your request could not be sent. Retry or contact us via Zalo or the hotline with this code.')}</p><button className="btn btn-ghost btn-sm" type="button" onClick={() => void sync(done)}>{tr('Gửi lại yêu cầu', 'Retry sending')}</button></div>}
        {sheet === 'idle' && <p className="sync pending">{tr('Vui lòng gửi mã đơn qua Zalo hoặc gọi hotline để xác nhận yêu cầu.', 'Please send this code via Zalo or call the hotline to confirm your request.')}</p>}
        {!localSaved && <p className="note">{tr('Thiết bị chưa lưu được mã đơn. Hãy sao chép mã và liên hệ MicroTech.', 'Your device could not save this request. Copy the code and contact MicroTech.')}</p>}
      </div>
      {CONFIG.showSheetOnSuccess && isSheetUrl(CONFIG.sheetUrl) && <a className="btn btn-ghost sheet-success-link" href={CONFIG.sheetUrl} target="_blank" rel="noopener noreferrer"><Icon name="external" />{tr('Mở Google Sheet', 'Open Google Sheet')}</a>}
      <div className="success-contact row">
        {CONFIG.social.zalo && <a className="btn btn-ghost" href={CONFIG.social.zalo} target="_blank" rel="noopener noreferrer"><Img k="socialZalo" className="inline-icon" />{tr('Liên hệ Zalo', 'Contact via Zalo')}</a>}
        {CONFIG.hotline && <a className="btn btn-ghost" href={`tel:${CONFIG.hotline.replace(/[^\d+]/g, '')}`}><Icon name="phone" />{CONFIG.hotline}</a>}
      </div>
      <button className="btn btn-lg" type="button" onClick={() => nav(`/track?code=${encodeURIComponent(done.code)}`, { state: { phone: done.phone } })}>{tr('Xem chi tiết đơn', 'View request details')}<Icon name="arrow" /></button>
      <Link to="/" className="btn btn-ghost">{tr('Về trang chủ', 'Back to home')}</Link>
    </div>
  </section>
  const err = (key: keyof Form) => {
    const message = String(errors[key]?.message || '')
    const labels = MESSAGES[message as keyof typeof MESSAGES]
    return <div className="field-error">{errors[key] && <p className="err" role="alert">{labels ? tr(labels[0], labels[1]) : tr('Kiểm tra lại trường này', 'Please check this field')}</p>}</div>
  }
  const price = estimate(v.service, v.device)
  const service = SERVICES.find((item) => item.id === v.service)
  return <section className="wrap page narrow booking-page">
    <span className="eyebrow">{tr('HỖ TRỢ TRONG VÀI BƯỚC', 'HELP IN A FEW STEPS')}</span>
    <h1>{tr('Đặt lịch hỗ trợ', 'Book a support session')}</h1>
    <p className="muted">{tr('Chỉ 4 bước. Không cần tạo tài khoản.', 'Just four steps. No account needed.')}</p>
    <div className="booking-card glass">
      <ol className="stepper" aria-label={tr('Tiến trình đặt lịch', 'Booking progress')} style={{ '--p': step / 3 } as CSSProperties}>{titles.map((title, i) => <li key={i} className={i === step ? 'on' : i < step ? 'ok' : ''} aria-current={i === step ? 'step' : undefined}><i>{i < step ? <Icon name="check" width="16" /> : i + 1}</i><span>{title}</span></li>)}</ol>
      <form onSubmit={onSubmit} noValidate className="form booking-form">
        {step === 0 && <fieldset className="slide" key="s0" ref={stepRef} tabIndex={-1}><legend>{tr('1. Chọn dịch vụ bạn cần', '1. Choose your service')}</legend>{SERVICES.map((item) => <label key={item.id} className={'opt' + (v.service === item.id ? ' sel' : '')}><input type="radio" value={item.id} {...register('service')} /><Img k={item.img} className="opt-ico" /><span><b>{tr(item.title, item.titleEn)}</b><small>{tr(item.desc, item.descEn)}</small></span><Icon name="check" className="opt-check" /></label>)}{err('service')}</fieldset>}
        {step === 1 && <fieldset className="slide" key="s1" ref={stepRef} tabIndex={-1}><legend>{tr('2. Thiết bị & sự cố', '2. Your device & issue')}</legend>
          <div className="seg" role="radiogroup" aria-label={tr('Loại thiết bị', 'Device type')}>{DEVICES.map((device) => <label key={device} className={v.device === device ? 'sel' : ''}><input type="radio" value={device} {...register('device')} />{device}</label>)}</div>{err('device')}
          {v.device && OS_VERSIONS[v.device] && <>
            <label>{tr('Phiên bản hệ điều hành', 'OS version')}<select aria-label={tr('Phiên bản hệ điều hành', 'OS version')} {...register('os')}><option value="">{tr('Chọn phiên bản', 'Select a version')}</option>{OS_VERSIONS[v.device].map((os) => <option key={os} value={os}>{os === 'Khác' ? tr('Khác', 'Other') : os}</option>)}</select></label>{err('os')}
            {v.device === 'iPhone' && <label>{tr('Vấn đề liên quan đến', 'Issue type')}<select {...register('issueKind')}><option value="">{tr('Chọn', 'Select')}</option>{IPHONE_ISSUES.map(([vi, en]) => <option key={vi} value={vi}>{tr(vi, en)}</option>)}</select></label>}
            <label>{tr('Hãng / model thiết bị (tùy chọn)', 'Brand / model (optional)')}<input {...register('brand')} placeholder={tr('VD: Dell XPS 13', 'e.g. Dell XPS 13')} maxLength={120} /></label>{err('brand')}
          </>}
          <label>{tr('Phần mềm cần cài hoặc lỗi gặp phải', 'Software to install or issue to fix')}<input {...register('issue')} placeholder={tr('VD: Cài Office / Lỗi 0x80070005', 'e.g. Office setup / Error 0x80070005')} maxLength={300} /></label>{err('issue')}
          <label>{tr('Mô tả chi tiết', 'More details')}<textarea rows={4} {...register('detail')} placeholder={tr('Mô tả tình trạng lỗi của bạn…', 'Tell us more about the issue…')} maxLength={3000} /></label>{err('detail')}
        </fieldset>}
        {step === 2 && <fieldset className="slide" key="s2" ref={stepRef} tabIndex={-1}><legend>{tr('3. Chọn lịch & hình thức hỗ trợ', '3. Pick a time & support method')}</legend>
          <label>{tr('Chọn ảnh/video lỗi (tùy chọn)', 'Choose an issue photo/video (optional)')}<input type="file" accept="image/jpeg,image/png,video/mp4" {...register('file')} /><small>{tr('JPG, PNG, MP4, tối đa 5 MB. Yêu cầu chỉ ghi tên tệp; gửi ảnh/video qua Zalo sau khi đặt lịch.', 'JPG, PNG, MP4, up to 5 MB. This request records the filename; send the actual file via Zalo after booking.')}</small></label>{err('file')}
          <div className="seg" role="radiogroup" aria-label={tr('Thời gian cần hỗ trợ', 'When you need help')}>{(Object.keys(URGENCY) as (keyof typeof URGENCY)[]).map((key) => <label key={key} className={v.urgency === key ? 'sel' : ''}><input type="radio" value={key} {...register('urgency')} />{tr(URGENCY[key][0], URGENCY[key][1])}</label>)}</div>
          {v.urgency === 'schedule' && <><label>{tr('Ngày hỗ trợ', 'Support date')}<input type="date" min={today()} {...register('date')} /></label>{err('date')}<div className="slots" role="radiogroup" aria-label={tr('Khung giờ (giờ Việt Nam)', 'Time slot (Vietnam time)')}>{SLOTS.map((slot) => <label key={slot} className={v.slot === slot ? 'sel' : ''}><input type="radio" value={slot} {...register('slot')} />{slot}</label>)}</div>{err('slot')}<small>{tr('Lịch hẹn theo giờ Việt Nam (UTC+7).', 'Appointments use Vietnam time (UTC+7).')}</small></>}
          <div className="seg" role="radiogroup" aria-label={tr('Hình thức hỗ trợ', 'Support method')}>{(Object.keys(METHODS) as (keyof typeof METHODS)[]).map((key) => <label key={key} className={v.method === key ? 'sel' : ''}><input type="radio" value={key} {...register('method')} />{tr(METHODS[key][0], METHODS[key][1])}</label>)}</div>
        </fieldset>}
        {step === 3 && <fieldset className="slide" key="s3" ref={stepRef} tabIndex={-1}><legend>{tr('4. Xác nhận thông tin', '4. Confirm your details')}</legend>
          <label>{tr('Họ và tên', 'Full name')}<input autoComplete="name" {...register('name')} maxLength={100} /></label>{err('name')}
          <label>{tr('Số điện thoại', 'Phone number')}<input type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} /></label>{err('phone')}
          <label>{tr('Email liên hệ', 'Contact email')}<input type="email" autoComplete="email" {...register('email')} maxLength={200} /></label>{err('email')}
          <dl className="summary"><dt>{tr('Dịch vụ', 'Service')}</dt><dd>{service && tr(service.title, service.titleEn)}</dd><dt>{tr('Thiết bị', 'Device')}</dt><dd>{v.device} · {v.os === 'Khác' ? tr('Khác', 'Other') : v.os}</dd><dt>{tr('Thời gian', 'When')}</dt><dd>{v.urgency === 'schedule' ? `${v.date} · ${v.slot}` : v.urgency && tr(URGENCY[v.urgency][0], URGENCY[v.urgency][1])}</dd><dt>{tr('Giá dự kiến', 'Estimated price')}</dt><dd>{price ? language === 'en' ? price.replace(/đ/g, ' VND') : price : tr('Báo giá sau khi xem xét sự cố.', 'Quoted after reviewing your issue.')}</dd></dl>
          <label className="check"><input type="checkbox" {...register('terms')} /><span>{tr('Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật.', 'I agree to the service terms and privacy policy.')}</span></label>{err('terms')}
        </fieldset>}
        <div className="actions">{step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>{tr('Quay lại', 'Back')}</button>}{step < 3 ? <button type="button" className="btn" onClick={() => void next()}>{tr('Tiếp tục', 'Continue')}<Icon name="arrow" /></button> : <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? tr('Đang gửi…', 'Sending…') : tr('Gửi yêu cầu hỗ trợ', 'Send support request')}<Icon name="arrow" /></button>}</div>
      </form>
    </div>
  </section>
}
