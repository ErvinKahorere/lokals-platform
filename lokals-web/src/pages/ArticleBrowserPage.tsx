import { useEffect, useMemo } from 'react'
import { ExternalLink, Globe, Share2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, SectionCard } from '../components/Ui'

export function ArticleBrowserPage() {
  const [searchParams] = useSearchParams()
  const url = searchParams.get('url') ?? ''
  const source = searchParams.get('source') ?? 'external source'
  const title = searchParams.get('title') ?? 'Article'
  const domain = useMemo(() => {
    try {
      return new URL(url).host
    } catch {
      return source
    }
  }, [source, url])

  useEffect(() => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [url])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionCard>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
            <Globe className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">External article</p>
            <h1 className="mt-2 text-2xl font-semibold text-lokals-charcoal">{title}</h1>
            <p className="mt-2 text-sm text-lokals-muted">
              You are leaving LOKALS to read the full story on <span className="font-semibold text-lokals-charcoal">{source}</span>.
            </p>
            <div className="mt-4 rounded-[20px] bg-lokals-surface p-4 text-sm text-lokals-muted">
              <p className="font-semibold text-lokals-charcoal">{domain}</p>
              <p className="mt-2">Content is provided by external sources. LOKALS does not own this content.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={url} target="_blank" rel="noreferrer">
            <Button>
              Continue to article
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({ title, url })
              } else {
                void navigator.clipboard.writeText(url)
              }
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-5 py-3 text-sm font-semibold text-lokals-charcoal shadow-sm transition hover:border-lokals-purple/30"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <Link to="/news" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-lokals-purple">
            Back to news
          </Link>
        </div>
      </SectionCard>
    </div>
  )
}
