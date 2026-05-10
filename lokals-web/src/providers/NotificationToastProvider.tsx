import type { PropsWithChildren } from 'react'
import { FloatingNotificationToast } from '../components/notifications/FloatingNotificationToast'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'

export function NotificationToastProvider({ children }: PropsWithChildren) {
  const {
    activeNotification,
    openNotification,
    dismissNotification,
  } = useRealtimeNotifications()

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 w-[min(100%-2rem,24rem)]">
        {activeNotification ? (
          <FloatingNotificationToast
            notification={activeNotification}
            onOpen={() => openNotification(activeNotification)}
            onDismiss={() => dismissNotification(activeNotification.id)}
          />
        ) : null}
      </div>
    </>
  )
}
