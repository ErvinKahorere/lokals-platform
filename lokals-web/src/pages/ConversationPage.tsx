import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, SectionCard } from '../components/Ui'
import { useConversation, useMarkConversationMessageRead, useSendConversationMessage } from '../hooks/queries'

export function ConversationPage() {
  const { id } = useParams()
  const [body, setBody] = useState('')
  const conversationQuery = useConversation(id)
  const sendMutation = useSendConversationMessage()
  const markReadMutation = useMarkConversationMessageRead()
  const conversation = conversationQuery.data?.data

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Messages" title={conversation?.subject ?? 'Conversation'} description="Live replies, read receipts, and lightweight attachments are ready for LOKALS messaging contexts." />

      <SectionCard className="bg-white p-5">
        {conversationQuery.isLoading ? <p className="text-sm text-lokals-muted">Loading conversation...</p> : null}
        {conversationQuery.error ? <EmptyState title="Conversation unavailable" body="Please try again in a moment." /> : null}
        {conversation ? (
          <>
            <div className="space-y-3">
              {(conversation.messages ?? []).map((message) => (
                <div key={message.id} className={`rounded-[20px] p-4 ${message.is_system ? 'bg-slate-100' : 'bg-lokals-purple-soft'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{message.user?.name ?? (message.is_system ? 'System' : 'Resident')}</p>
                  <p className="mt-2 text-sm text-lokals-charcoal">{message.body}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" onClick={() => markReadMutation.mutate(message.id)}>Mark read</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-[120px] w-full rounded-[20px] border border-lokals-border px-4 py-3 text-sm outline-none focus:border-lokals-purple"
                placeholder="Write a message"
              />
              <Button
                onClick={() => {
                  if (!conversation || !body.trim()) return
                  sendMutation.mutate({ conversationId: conversation.id, body: body.trim() }, { onSuccess: () => setBody('') })
                }}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send message'}
              </Button>
            </div>
          </>
        ) : null}
      </SectionCard>
    </div>
  )
}
