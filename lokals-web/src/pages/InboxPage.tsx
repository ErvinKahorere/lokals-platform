import { Link } from 'react-router-dom'
import { EmptyState, PageHeader, SectionCard } from '../components/Ui'
import { useConversations } from '../hooks/queries'

export function InboxPage() {
  const conversationsQuery = useConversations()
  const items = conversationsQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Messages" title="Inbox" description="Marketplace enquiries, service chats, project coordination, and support threads in one place." />

      <SectionCard className="bg-white p-5">
        {conversationsQuery.isLoading ? <p className="text-sm text-lokals-muted">Loading conversations...</p> : null}
        {conversationsQuery.error ? <EmptyState title="Inbox unavailable" body="Please try again in a moment." /> : null}
        {!conversationsQuery.isLoading && !conversationsQuery.error && items.length === 0 ? (
          <EmptyState title="No conversations yet" body="Messages from marketplace, services, support, and local collaboration will appear here." />
        ) : null}
        <div className="space-y-3">
          {items.map((conversation) => (
            <Link key={conversation.id} to={`/conversations/${conversation.id}`} className="block rounded-[22px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lokals-green">{conversation.context.replaceAll('_', ' ')}</p>
                  <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">{conversation.subject ?? 'Conversation'}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-lokals-muted">{conversation.last_message?.body ?? 'Open the thread to continue.'}</p>
                </div>
                <span className="rounded-full bg-lokals-purple-soft px-3 py-1 text-xs font-semibold text-lokals-purple">{conversation.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
