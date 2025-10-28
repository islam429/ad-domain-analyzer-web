import { Admin, Resource, List, Datagrid, TextField, NumberField } from 'react-admin'
import { dataProvider } from './dataProvider'

const DomainList = () => (
  <List perPage={50} pagination={false}>
    <Datagrid rowClick="show">
      <TextField source="domain" label="Domain" />
      <NumberField source="organic_etv" label="Organic ETV" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="paid_etv" label="Paid ETV" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="featured_snippet_etv" label="Featured ETV" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="local_pack_etv" label="Local ETV" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="visits_search_total" label="Visits (Search)" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="conversions_15" label="Conv 1.5%" options={{ maximumFractionDigits: 0 }} />
      <NumberField source="conversions_25" label="Conv 2.5%" options={{ maximumFractionDigits: 0 }} />
    </Datagrid>
  </List>
)

export default function App() {
  return (
    <Admin dataProvider={dataProvider} disableTelemetry>
      <Resource name="domains" list={DomainList} />
    </Admin>
  )
}
