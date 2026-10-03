import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'

const original = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8')
function harness(configured = true, missingTab = false) {
  const rows = [], calls = { opens: 0, locks: 0, releases: 0, flushes: 0, tabs: [] }
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: (row) => rows.push(Array.from(row)), setFrozenRows() {},
    getRange: () => ({ setFontWeight() {}, createTextFinder: (code) => ({ matchEntireCell: () => ({ findNext: () => rows.slice(1).some((row) => row[0] === code) ? {} : null }) }) }),
  }
  const context = vm.createContext({
    console: { error() {} },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (value) => ({ value, setMimeType() { return this } }) },
    SpreadsheetApp: { openById: () => { calls.opens++; return { getSheetByName: (name) => { calls.tabs.push(name); return !missingTab && name === ' Support Requests' ? sheet : null } } }, flush: () => calls.flushes++ },
    LockService: { getScriptLock: () => ({ waitLock: () => calls.locks++, releaseLock: () => calls.releases++ }) },
  })
  const spreadsheetId = configured ? 'test-spreadsheet-id' : 'DAN_ID_GOOGLE_SHEET_CUA_BAN'
  vm.runInContext(original.replace(/^const SPREADSHEET_ID = '[^']+';$/m, `const SPREADSHEET_ID = '${spreadsheetId}';`), context)
  return { rows, calls, post: (data) => JSON.parse(context.doPost({ postData: { contents: typeof data === 'string' ? data : JSON.stringify(data) } }).value), health: () => JSON.parse(context.doGet().value) }
}
const order = { code: 'MT-20261003-A1B2C3D4', createdAt: 1790971200000, name: 'Test User', phone: '+84377339643', email: 'test@example.com', service: 'Cài phần mềm', device: 'Windows', os: 'Windows 11', issue: 'Install Office for work', urgency: 'Trong hôm nay', method: 'Hỗ trợ từ xa', price: '50.000đ' }

test('creates headers and a complete order row, preserving the phone as text', () => {
  const h = harness(), result = h.post(order)
  assert.equal(result.ok, true)
  assert.equal(h.rows.length, 2)
  assert.equal(h.rows[0].length, 13)
  assert.equal(h.rows[1][0], order.code)
  assert.equal(h.rows[1][3], "'" + order.phone)
  assert.equal(h.rows[1][8], order.issue)
  assert.equal(h.rows[1][12], 'Đã nhận yêu cầu')
  assert.deepEqual(h.calls.tabs, [' Support Requests'])
  assert.equal(h.calls.releases, 1)
})
test('retrying the same request does not create another order', () => {
  const h = harness()
  assert.equal(h.post(order).ok, true)
  assert.equal(h.post(order).duplicate, true)
  assert.equal(h.rows.length, 2)
  assert.equal(h.calls.releases, 2)
})
test('reports a missing tab without creating or writing another tab', () => {
  const h = harness(true, true), result = h.post(order)
  assert.equal(result.ok, false)
  assert.match(result.message, /Sheet tab not found/)
  assert.equal(h.rows.length, 0)
  assert.equal(h.calls.releases, 1)
})
test('keeps customer input as text rather than executing spreadsheet formulas', () => {
  const h = harness()
  h.post({ ...order, name: '=1+1', issue: '  =HYPERLINK("https://example.com")' })
  assert.equal(h.rows[1][2], "'=1+1")
  assert.equal(h.rows[1][8], "'  =HYPERLINK(\"https://example.com\")")
})
test('rejects malformed, incomplete and oversized requests before writing', () => {
  for (const data of ['{bad json', { ...order, phone: '' }, { ...order, code: '=1+1' }, { ...order, createdAt: 'bad' }, 'x'.repeat(25001)]) {
    const h = harness()
    assert.equal(h.post(data).ok, false)
    assert.equal(h.rows.length, 0)
    assert.equal(h.calls.opens, 0)
  }
})
test('writes the selected appointment time and supports legacy order codes', () => {
  const h = harness()
  assert.equal(h.post({ ...order, code: 'MT-20261003-001', date: '2026-10-04', slot: '08:00 - 09:00' }).ok, true)
  assert.equal(h.rows[1][9], '2026-10-04 08:00 - 09:00')
})
test('reports an unconfigured spreadsheet without writing; health never exposes orders', () => {
  const h = harness(false)
  assert.equal(h.post(order).ok, false)
  assert.equal(h.calls.opens, 0)
  assert.equal(h.health().ok, true)
  assert.equal(Object.keys(h.health()).join(','), 'ok,service')
})
