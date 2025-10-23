import { Admin, Resource, ListGuesser } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'

const apiUrl =
  import.meta.env.VITE_WEB_API_URL ??
  `/api` // Kleinste Annahme: Next.js gibt REST-Routen unter /api aus.

const dataProvider = simpleRestProvider(apiUrl)

export default function App() {
  return (
    <Admin dataProvider={dataProvider} disableTelemetry>
      <Resource name="domains" list={ListGuesser} />
    </Admin>
  )
}
