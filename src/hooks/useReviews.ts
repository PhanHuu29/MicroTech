import { useEffect, useRef, useState } from 'react'
import { emptyReviews, loadReviews } from '../lib/reviews'

export function useReviews(service = '', rating = '', limit = 6, revision = 0) {
  const [data, setData] = useState(emptyReviews)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)
  const [retry, setRetry] = useState(0)
  const generation = useRef(0)
  const currentRequest = useRef<AbortController>()
  const morePending = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    generation.current++; currentRequest.current = controller; morePending.current = false
    setLoading(true); setFailed(false); setMoreLoading(false); setData(emptyReviews())
    loadReviews({ service, rating, limit }, controller.signal).then((next) => {
      if (!controller.signal.aborted) setData(next)
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => { controller.abort(); generation.current++ }
  }, [service, rating, limit, revision, retry])
  const more = async () => {
    if (data.nextOffset === null || morePending.current) return
    const requestGeneration = generation.current
    morePending.current = true
    setMoreLoading(true); setFailed(false)
    try {
      const next = await loadReviews({ service, rating, limit, offset: data.nextOffset }, currentRequest.current?.signal)
      if (requestGeneration !== generation.current) return
      setData((previous) => ({ ...next, reviews: [...previous.reviews, ...next.reviews.filter((review) => !previous.reviews.some((r) => r.id === review.id))] }))
    } catch { if (requestGeneration === generation.current) setFailed(true) }
    finally { if (requestGeneration === generation.current) { setMoreLoading(false); morePending.current = false } }
  }
  return { data, loading, failed, moreLoading, more, reload: () => setRetry((n) => n + 1) }
}
