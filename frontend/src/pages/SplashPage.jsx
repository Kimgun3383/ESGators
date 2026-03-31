/**
 * Splash Page
 *
 * Landing page displayed to users before authentication.
 *
 * Last Edit: Nicholas Sardinia, 3/1/2026
 */
import { NavLink } from "react-router-dom"
import { buttonVariants } from "../components/ui/button"
import { cn } from "../lib/utils"
import "./SplashPage.css"

const coreFeatures = [
  {
    title: "Monitor",
    description: "View live environmental telemetry and node status in one place.",
  },
  {
    title: "Provision",
    description: "Create nodes, assign ownership, and issue credentials with a cleaner workflow.",
  },
  {
    title: "Report",
    description: "Hand off into dashboards and operational views built for ESG visibility.",
  },
]

const trustPoints = ["Telemetry", "Node Management", "Secure Access", "Dashboard Ready"]
const previewStats = [
  { label: "Active nodes", value: "128" },
  { label: "Reporting status", value: "Healthy" },
  { label: "Latest sync", value: "2 min ago" },
]

function SplashPage() {
  return (
    <div className="splash-root">
      <header className="sticky top-0 z-5 border-b border-[rgba(255,255,255,0.04)] bg-[linear-gradient(180deg,rgba(9,11,16,0.88),rgba(9,11,16,0.55),transparent)] py-[18px] backdrop-blur-[14px]">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-7 max-[720px]:flex-col max-[720px]:items-start max-[720px]:px-4 max-[720px]:pt-4">
          <div className="inline-flex items-center gap-[10px] text-[0.96rem] font-bold">
            <span
              aria-hidden="true"
              className="size-[11px] rounded-full shadow-[0_0_0_6px_rgba(62,207,142,0.1)]"
              style={{ background: "linear-gradient(135deg, #3ecf8e, #69a8ff)" }}
            />
            <span>ESGators</span>
          </div>
          <nav className="flex items-center gap-5 max-[720px]:flex-col max-[720px]:items-start" aria-label="Primary">
            <a className="text-[0.94rem] text-[var(--muted)] no-underline transition-colors hover:text-[var(--text)]" href="#platform-overview">
              Platform
            </a>
            <a className="text-[0.94rem] text-[var(--muted)] no-underline transition-colors hover:text-[var(--text)]" href="#capabilities">
              Capabilities
            </a>
            <NavLink className={buttonVariants({ variant: "secondary", size: "sm" })} to="/auth">
              Sign In
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="pb-[88px]">
        <section className="mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] items-center gap-10 px-7 pt-14 max-[960px]:grid-cols-1 max-[720px]:gap-7 max-[720px]:px-4 max-[720px]:pt-[34px]">
          <div>
            <p className="mb-[14px] text-[0.84rem] font-bold uppercase tracking-[0.14em] text-[#b6f1d2]">
              ESG intelligence for connected operations
            </p>
            <h1 className="mb-[18px] max-w-[11ch] text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.96] tracking-[-0.04em] max-[960px]:max-w-[14ch] max-[720px]:max-w-none max-[720px]:text-[clamp(2.2rem,11vw,3.5rem)]">
              Environmental monitoring for teams building modern ESG programs.
            </h1>
            <p className="m-0 max-w-[54ch] text-[1.02rem] leading-[1.72] text-[var(--muted)]">
              ESGators brings telemetry, node provisioning, and dashboard visibility into a single platform
              that feels clear before login and useful after it.
            </p>

            <div className="my-7 flex flex-wrap gap-3">
              <NavLink className={buttonVariants({ size: "default" })} to="/auth">
                Start with ESGators
              </NavLink>
              <a className={buttonVariants({ variant: "secondary", size: "default" })} href="#platform-overview">
                View platform
              </a>
            </div>

            <div className="flex flex-wrap gap-[10px]" aria-label="Platform capabilities">
              {trustPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] px-[14px] py-[10px] text-[0.92rem] text-[#d9e2ef]"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <aside className="splash-showcase" aria-label="Platform snapshot">
            <div className="splash-showcase-grid" aria-hidden="true" />
            <div className="splash-showcase-glow" aria-hidden="true" />
            <div className="splash-showcase-heading">
              <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Platform Overview</p>
              <strong className="block max-w-[10ch] text-[1.7rem] leading-[1.2]">Unified ESG workspace</strong>
            </div>
            <div className="splash-showcase-chart" aria-hidden="true">
              <span className="chart-bar chart-bar-one" />
              <span className="chart-bar chart-bar-two" />
              <span className="chart-bar chart-bar-three" />
              <span className="chart-bar chart-bar-four" />
              <span className="chart-bar chart-bar-five" />
            </div>
            <div className="splash-showcase-stats">
              {previewStats.map((stat) => (
                <div key={stat.label} className="border-t border-t-[rgba(255,255,255,0.06)] pt-4">
                  <span className="mb-2 block text-[0.86rem] text-[var(--muted)]">{stat.label}</span>
                  <strong className="text-base text-[#edf4ff]">{stat.value}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="platform-overview" className="mt-[72px] pt-8">
          <div className="mx-auto w-full max-w-[1180px] px-7 max-[720px]:px-4">
            <div className="mb-6 max-w-[700px]">
              <p className="mb-[10px] pt-2 text-base font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Platform</p>
              <h2 className="mb-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">Use one platform for sensing, provisioning, and visibility.</h2>
              <p className="mb-[18px] text-base font-medium text-[var(--muted)]">
                A simpler structure, clearer hierarchy, and less copy make the product easier to understand at a glance.
              </p>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="mt-[72px] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_82%)] pb-2 pt-8"
        >
          <div className="mx-auto w-full max-w-[1180px] px-7 max-[720px]:px-4">
            <div className="mb-6 max-w-[700px]">
              <p className="mb-[10px] pt-2 text-base font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Capabilities</p>
              <h2 className="mb-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">Built to help teams manage ESG telemetry without extra clutter.</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[960px]:grid-cols-1">
              {coreFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.018)] p-[18px]"
                >
                  <h3 className="mb-[10px] text-[1.05rem] font-semibold">{feature.title}</h3>
                  <p className="m-0 leading-[1.65] text-[var(--muted)]">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-[72px] pt-8">
          <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 rounded-[22px] border border-[rgba(62,207,142,0.18)] bg-[linear-gradient(135deg,rgba(62,207,142,0.08),rgba(105,168,255,0.06))] px-6 py-[22px] max-[720px]:flex-col max-[720px]:items-start">
            <div>
              <p className="mb-[10px] pt-2 text-base font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Get Started</p>
              <h2 className="mb-2 text-[clamp(1.4rem,2.4vw,2rem)] font-semibold">Sign in and open the workspace.</h2>
            </div>
            <NavLink className={cn(buttonVariants({ size: "default" }), "shrink-0")} to="/auth">
              Enter ESGators
            </NavLink>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SplashPage
