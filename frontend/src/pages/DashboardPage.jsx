/**
 * Dashboard Page
 * 
 * TODO: Replace with Grafana dashbaord.
 * 
 * Last Edit: Nicholas Sardinia, 3/1/2026
 */
import axios from "axios"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "../lib/api"

function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/data`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
  }, [])

  return (
    <section className="workspace-content">
      <p className="page-kicker">Overview</p>
      <div className="data-card">
        <p className="data-card-label">Live Payload</p>
        <pre className="data-json">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  )
}

export default DashboardPage
