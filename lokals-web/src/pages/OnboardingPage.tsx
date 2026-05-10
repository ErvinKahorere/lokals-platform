import { useNavigate } from 'react-router-dom'
import { OnboardingFlow } from '../components/experience/OnboardingFlow'

export function OnboardingPage() {
  const navigate = useNavigate()

  const finishOnboarding = () => {
    window.localStorage.setItem('lokals-onboarding-complete', 'true')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <OnboardingFlow
        onGetStarted={() => {
          finishOnboarding()
          navigate('/register')
        }}
        onSkip={() => {
          finishOnboarding()
          navigate('/home')
        }}
        onLogin={() => {
          finishOnboarding()
          navigate('/login')
        }}
      />
    </div>
  )
}
