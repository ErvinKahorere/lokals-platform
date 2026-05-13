import { useMemo, useState } from 'react'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { useEscalateSupportConversation, useSupportChat, useSupportConversations } from '../hooks/queries'

export function SupportPage() {
  const [message, setMessage] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)
  const conversationsQuery = useSupportConversations()
  const chatMutation = useSupportChat()
  const escalateMutation = useEscalateSupportConversation()

  const selectedConversation = useMemo(() => {
    const items = conversationsQuery.data ?? []
    return items.find((item) => item.id === selectedConversationId) ?? items[0] ?? null
  }, [conversationsQuery.data, selectedConversationId])

  const sendMessage = async () => {
    if (!message.trim()) return
    const payload = await chatMutation.mutateAsync({
      message: message.trim(),
      conversationId: selectedConversation?.id,
    })
    setSelectedConversationId(payload.data.id)
    setMessage('')
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Support" title="Ask LOKALS for help" description="Get guided help for reports, services, rides, deliveries, and town information, then escalate to a human when needed." />

      <SectionCard className="bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {['How do I report a water leak?', 'Help me find a taxi', 'How do I track my request?'].map((item) => (
            <button key={item} type="button" onClick={() => setMessage(item)} className="rounded-full border border-lokals-border bg-slate-50 px-4 py-2 text-sm font-medium text-lokals-charcoal">
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about reports, services, rides, or town contacts" />
          <Button onClick={sendMessage} disabled={chatMutation.isPending}>{chatMutation.isPending ? 'Sending...' : 'Send'}</Button>
          <Button
            variant="secondary"
            disabled={!selectedConversation}
            onClick={() => selectedConversation && escalateMutation.mutate({ conversationId: selectedConversation.id, reason: 'Resident requested human help' })}
          >
            Escalate
          </Button>
        </div>
      </SectionCard>

      <QueryState isLoading={conversationsQuery.isLoading} error={conversationsQuery.error} empty={(conversationsQuery.data?.length ?? 0) === 0}>
        {(conversationsQuery.data?.length ?? 0) === 0 ? (
          <EmptyState title="No support conversations yet" body="Start a chat above and LOKALS will guide you to the right feature or service desk." />
        ) : (
          <SectionCard className="bg-white p-5">
            <div className="space-y-3">
              {(selectedConversation?.messages ?? []).map((item) => (
                <div
                  key={item.id}
                  className={`max-w-2xl rounded-[22px] px-4 py-3 text-sm ${item.sender_type === 'user' ? 'ml-auto bg-lokals-purple text-white' : 'bg-slate-50 text-lokals-charcoal'}`}
                >
                  <p>{item.body}</p>
                  {item.metadata?.route_hint ? <p className={`mt-2 text-xs ${item.sender_type === 'user' ? 'text-white/75' : 'text-lokals-muted'}`}>Suggested route: {String(item.metadata.route_hint)}</p> : null}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </QueryState>
    </div>
  )
}
