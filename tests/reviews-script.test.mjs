import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8')
function harness() {
  const sheets = new Map(), calls = { flushes: 0, locks: 0, releases: 0 }
  const makeSheet = (name) => {
    const rows = [], settings = {}
    const sheet = {
      rows, settings, getLastRow: () => rows.length, getMaxRows: () => 1000,
      appendRow: (row) => rows.push(Array.from(row)), setFrozenRows: (n) => { settings.frozen = n }, setColumnWidth() {},
      getRange: (r, c, n = 1, m = 1) => ({
        getValues: () => rows.slice(r - 1, r - 1 + n).map((row) => row.slice(c - 1, c - 1 + m)),
        setFontWeight() {}, setDataValidation: (rule) => { settings.validation = rule }, setNumberFormat() {}, setWrap() {},
        createTextFinder: (id) => ({ matchEntireCell() { return this }, findNext: () => {
          const index = rows.findIndex((row, i) => i >= r - 1 && i < r - 1 + n && row[c - 1] === id)
          return index < 0 ? null : { getRow: () => index + 1 }
        } }),
      }),
    }
    sheets.set(name, sheet); return sheet
  }
  const orders = makeSheet('Support Requests')
  const rule = { requireValueInList(values) { this.values = values; return this }, setAllowInvalid() { return this }, build() { return this } }
  const context = vm.createContext({
    console: { error() {}, log() {} },
    ContentService: { MimeType: { JSON: 'json', JAVASCRIPT: 'javascript' }, createTextOutput: (value) => ({ value, getContent() { return value }, setMimeType() { return this } }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: (name) => sheets.get(name), insertSheet: makeSheet }), flush: () => calls.flushes++, newDataValidation: () => rule },
    LockService: { getScriptLock: () => ({ waitLock: () => calls.locks++, releaseLock: () => calls.releases++ }) },
  })
  vm.runInContext(source, context)
  return { sheets, orders, calls, context, post: (d) => JSON.parse(context.doPost({ postData: { contents: JSON.stringify(d) } }).value), get: (p) => JSON.parse(context.doGet({ parameter: p }).value), rawGet: (p) => context.doGet({ parameter: p }).value }
}
const review = { action: 'review', id: 'MT-RV-12345678-1234-1234-1234-123456789abc', receipt: 'abcdefab-1234-1234-1234-123456789abc', name: 'Khách thử nghiệm', service: 'install', rating: 5, comment: 'Hỗ trợ nhanh và giải thích rõ ràng.', consent: true }

test('a review is stored in its own tab, pending and with server time; booking cells stay untouched', () => {
  const h = harness(), result = h.post({ ...review, createdAt: 0, status: 'Đã duyệt' })
  assert.equal(result.ok, true)
  const rows = h.sheets.get('Reviews').rows
  assert.equal(rows.length, 2)
  assert.equal(rows[1][6], 'Chờ duyệt')
  assert.equal(rows[1][1].getTime() > 1700000000000, true)
  assert.equal(h.orders.rows.length, 0)
  assert.equal(h.calls.releases, 1)
  assert.equal(h.get({ action: 'reviews' }).summary.count, 0)
})
test('receipt confirmation is separate from opaque POST and never returns customer text or secrets', () => {
  const h = harness(); h.post(review)
  assert.deepEqual(h.get({ action: 'review-status', id: review.id, receipt: review.receipt }), { ok: true, kind: 'review-status', received: true })
  assert.equal(h.get({ action: 'review-status', id: review.id, receipt: 'ffffffff-1234-1234-1234-123456789abc' }).received, false)
  assert.equal(h.get({ action: 'review-status' }).received, false)
})
test('retrying an ID is idempotent and a different receipt cannot take over that ID', () => {
  const h = harness(); h.post(review)
  assert.equal(h.post(review).duplicate, true)
  assert.equal(h.post({ ...review, receipt: 'ffffffff-1234-1234-1234-123456789abc' }).ok, false)
  assert.equal(h.sheets.get('Reviews').rows.length, 2)
})
test('public output excludes pending, hidden and non-consenting rows and all private columns', () => {
  const h = harness(); h.post(review)
  const rows = h.sheets.get('Reviews').rows
  rows.push([...rows[1]]); rows[2][0] += '-second'; rows[2][6] = 'Ẩn'
  rows.push([...rows[1]]); rows[3][0] += '-third'; rows[3][6] = 'Đã duyệt'; rows[3][8] = false
  rows[1][6] = 'Đã duyệt'
  const d = h.get({ action: 'reviews' })
  assert.equal(d.reviews.length, 1)
  assert.deepEqual(Object.keys(d.reviews[0]).sort(), ['comment', 'createdAt', 'id', 'name', 'rating', 'service'])
  assert.equal(JSON.stringify(d).includes(review.receipt), false)
  assert.equal(d.summary.count, 1)
})
test('one-star reviews can be published; summary is computed from published rows regardless of filters', () => {
  const h = harness(); h.post(review)
  h.post({ ...review, id: 'MT-RV-22345678-1234-1234-1234-123456789abc', rating: 1, service: 'trouble' })
  h.sheets.get('Reviews').rows.slice(1).forEach((row) => { row[6] = 'Đã duyệt' })
  const d = h.get({ action: 'reviews', service: 'trouble', rating: '1' })
  assert.equal(d.reviews.length, 1)
  assert.equal(d.reviews[0].rating, 1)
  assert.equal(d.summary.average, 3)
  assert.deepEqual(d.summary.distribution, [1, 0, 0, 0, 1])
})
test('pagination bounds the response and sorts by server date without exposing receipts', () => {
  const h = harness(); h.post(review)
  const rows = h.sheets.get('Reviews').rows
  rows[1][6] = 'Đã duyệt'; rows[1][1] = new Date('2026-10-01T00:00:00Z')
  rows.push([...rows[1]]); rows[2][0] += '-newer'; rows[2][1] = new Date('2026-10-02T00:00:00Z')
  const first = h.get({ action: 'reviews', limit: '1' })
  assert.equal(first.reviews[0].id, rows[2][0]); assert.equal(first.nextOffset, 1)
  const second = h.get({ action: 'reviews', limit: '1', offset: '1' })
  assert.equal(second.reviews[0].id, review.id); assert.equal(second.nextOffset, null)
})
test('invalid fields, absent consent and attempts to approve via POST never create a review', () => {
  for (const patch of [{ rating: 0 }, { rating: 6 }, { rating: '5' }, { comment: 'short' }, { name: ' ' }, { service: 'unknown' }, { receipt: '' }, { consent: false }, { action: 'approve-review' }]) {
    const h = harness(); assert.equal(h.post({ ...review, ...patch }).ok, false)
    assert.equal(h.sheets.has('Reviews'), false)
  }
})
test('callback injection is rejected and valid JSONP contains only the read response', () => {
  const h = harness()
  const callback = 'mt_reviews_1234567890abcdef1234567890abcdef'
  const raw = h.rawGet({ action: 'reviews', callback })
  assert.ok(raw.startsWith(callback + '(')); assert.ok(raw.endsWith(');'))
  assert.equal(JSON.parse(raw.slice(callback.length + 1, -2)).kind, 'reviews')
  assert.equal(JSON.parse(h.rawGet({ action: 'reviews', callback: 'alert(1)//' })).ok, false)
})
test('formula-like input stays text in Sheets, and setup is idempotent with a moderation dropdown', () => {
  const h = harness(); h.post({ ...review, name: '=1+1', comment: '=HYPERLINK("https://example.com")' })
  const rows = h.sheets.get('Reviews').rows
  assert.equal(rows[1][2], "'=1+1"); assert.equal(rows[1][5].startsWith("'="), true)
  h.context.setupReviews(); h.context.setupReviews()
  assert.equal(rows.length, 2)
  assert.deepEqual(Array.from(h.sheets.get('Reviews').settings.validation.values), ['Chờ duyệt', 'Đã duyệt', 'Ẩn'])
})
test('an existing unrelated Reviews tab is not overwritten', () => {
  const h = harness(); h.context.setupReviews()
  const rows = h.sheets.get('Reviews').rows; rows[0][0] = 'Other table'
  assert.equal(h.post(review).ok, false); assert.equal(rows.length, 1)
  assert.equal(h.get({ action: 'reviews' }).ok, false)
})
