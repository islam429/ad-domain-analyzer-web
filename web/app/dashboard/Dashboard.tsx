import AppShell from '@/components/layout/AppShell'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { Plan } from '@/lib/plan'

export default function Dashboard({ plan }: { plan: Plan }) {
  return (
    <AppShell plan={plan}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Domains (Monat)" subtitle="aktuelle Abrechnung" />
          <CardBody>
            <div className="text-3xl font-semibold">1 234</div>
            <p className="text-slate-500 text-sm mt-1">verarbeitete Domains</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Visits (Search)" subtitle="Summe aus ETV" />
          <CardBody>
            <div className="text-3xl font-semibold">5 566 795</div>
            <p className="text-slate-500 text-sm mt-1">geschätzt (DataForSEO)</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Conversion-Forecast" subtitle="1.5% / 2.5%" />
          <CardBody>
            <div className="text-lg">
              1.5%: <span className="font-semibold">83 502</span>
            </div>
            <div className="text-lg">
              2.5%: <span className="font-semibold">139 170</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
