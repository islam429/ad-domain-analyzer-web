import Link from "next/link";

async function getSession(sessionId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL ?? ''}/api/billing/session?session_id=${sessionId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function BillingSuccess({ searchParams }: { searchParams: { session_id?: string } }) {
  const sessionId = searchParams?.session_id;
  let session: any = null;

  if (sessionId) {
    try {
      session = await getSession(sessionId);
    } catch (err) {
      console.error("[billing-success] failed to load session", err);
    }
  }

  return (
    <main className="mx-auto my-16 max-w-3xl font-[system-ui] px-6">
      <div className="rounded-3xl border bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Vielen Dank!</h1>
        <p className="mt-2 text-gray-600">
          Deine Zahlung wurde verarbeitet und dein Abonnement ist aktiv.
        </p>

        {session ? (
          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Status:</span> {session.status ?? "unbekannt"}
            </div>
            {session.plan && (
              <div>
                <span className="font-medium">Plan:</span> {session.plan}
              </div>
            )}
            {session.amount && session.currency && (
              <div>
                <span className="font-medium">Betrag:</span> {(session.amount / 100).toLocaleString(undefined, { style: 'currency', currency: session.currency.toUpperCase() })}
              </div>
            )}
            {session.subscription && (
              <div>
                <span className="font-medium">Subscription:</span> {session.subscription}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-amber-600">
            Wir konnten die Session-Details nicht laden. Dein Kauf wurde möglicherweise bereits verbucht.
          </p>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
