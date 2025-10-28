'use client'

import React from 'react'

export default function DatenschutzPage() {
  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )

  return (
    <main className="prose mx-auto max-w-3xl px-6 py-12">
      <h1>Datenschutzerklärung</h1>

      <Section title="1. Verantwortlicher">
        <p>
          Soul Software Solution
          <br />
          Margaretengürtel 106/8/9
          <br />
          1050 Vienna
          <br />
          Austria
          <br />
          E-Mail: support@pryos.io
        </p>
      </Section>

      <Section title="2. Erhebung und Speicherung personenbezogener Daten">
        <p>
          Wir verarbeiten personenbezogene Daten, die Sie uns aktiv zur Verfügung stellen oder die bei der Nutzung
          unserer Website automatisch erfasst werden. Dazu zählen unter anderem Name, E-Mail-Adresse, IP-Adresse,
          Browserinformationen und aufgerufene Seiten.
        </p>
      </Section>

      <Section title="3. Zwecke der Datenverarbeitung">
        <ul>
          <li>Bereitstellung unserer Online-Angebote</li>
          <li>Bearbeitung Ihrer Anfragen</li>
          <li>Analyse und Optimierung der Website</li>
          <li>Erfüllung gesetzlicher Verpflichtungen</li>
        </ul>
      </Section>

      <Section title="4. Rechtsgrundlagen">
        <p>
          Die Verarbeitung erfolgt insbesondere auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung),
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) sowie, sofern erforderlich, Art. 6 Abs. 1 lit. a DSGVO
          (Einwilligung).
        </p>
      </Section>

      <Section title="5. Empfänger">
        <p>
          Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, wenn dies zur Vertragserfüllung notwendig ist, eine
          gesetzliche Verpflichtung besteht oder Sie ausdrücklich eingewilligt haben.
        </p>
      </Section>

      <Section title="6. Speicherdauer">
        <p>
          Wir speichern personenbezogene Daten nur solange, wie dies für die genannten Zwecke erforderlich ist oder wir
          gesetzlich dazu verpflichtet sind.
        </p>
      </Section>

      <Section title="7. Ihre Rechte">
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie das Recht auf
          Datenübertragbarkeit. Zudem können Sie der Verarbeitung widersprechen und erteilte Einwilligungen jederzeit
          widerrufen.
        </p>
      </Section>

      <Section title="8. Beschwerderecht">
        <p>
          Ihnen steht das Recht zu, sich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung Ihrer
          personenbezogenen Daten zu beschweren.
        </p>
      </Section>

      <Section title="9. Aktualität">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die jeweils aktuelle Fassung finden
          Sie stets auf dieser Seite.
        </p>
      </Section>
    </main>
  )
}
