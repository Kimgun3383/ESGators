/**
 * Dashboard Page
 *
 * TODO: Replace with Grafana dashbaord.
 *
 * Last Edit: Nicholas Sardinia, 3/1/2026
 */
import { useEffect } from "react"

const grafanaDashboardUrl = import.meta.env.VITE_GRAFANA_DASHBOARD_URL

const DashboardPage = () => {
  useEffect(() => {
    if (grafanaDashboardUrl) {
      window.location.replace(grafanaDashboardUrl)
    }
  }, [])

  if (!grafanaDashboardUrl) {
    return (
      <section className="max-w-[940px]">
        <p className="mb-[10px] pt-2 text-base font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Dashboard</p>
        <h1 className="mb-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">Grafana URL is missing</h1>
        <p className="mb-[18px] text-base font-medium text-[var(--muted)]">
          Set <strong>VITE_GRAFANA_DASHBOARD_URL</strong> in <strong>frontend/.env</strong> with your Grafana dashboard share URL.
        </p>
      </section>
    )
  }

  return (
    <section className="max-w-[940px]">
      <p className="mb-[10px] pt-2 text-base font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Dashboard</p>
      <h1 className="mb-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">Redirecting to Grafana...</h1>
      <p className="mb-[18px] text-base font-medium text-[var(--muted)]">If you are not redirected automatically, open the dashboard link below.</p>
      <a className="text-[#b6f1d2] underline decoration-[rgba(182,241,210,0.35)] underline-offset-4" href={grafanaDashboardUrl} target="_blank" rel="noreferrer">
        Open Grafana Dashboard
      </a>
    </section>
  )
}

export default DashboardPage
