import { EmptyState } from '../Ui'

export function EmptyDashboardState({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return <EmptyState title={title} body={body} />
}
