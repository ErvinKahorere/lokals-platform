import { EmptyState, PageHeader, SectionCard } from '../../components/Ui'

export function AccountPlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Account" title={title} description={description} />
      <SectionCard className="bg-white">
        <EmptyState title={`${title} is almost ready`} body="This account area is being polished next. The link is active now so you can keep moving through Profile without hitting a dead end." />
      </SectionCard>
    </div>
  )
}
