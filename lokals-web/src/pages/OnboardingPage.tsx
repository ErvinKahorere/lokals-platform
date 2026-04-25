import { OnboardingFlow } from '../components/experience/OnboardingFlow'

export function OnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <OnboardingFlow onComplete={() => {
        window.localStorage.setItem('lokals-onboarding-complete', 'true')
      }} />
    </div>
  )
}
