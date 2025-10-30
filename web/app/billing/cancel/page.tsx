import Link from "next/link";

export default function BillingCancel() {
  return (
    <main className="mx-auto my-16 max-w-3xl font-[system-ui] px-6">
      <div className="rounded-3xl border bg-white/80 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout abgebrochen</h1>
        <p className="mt-2 text-gray-600">
          Alles gut – du kannst jederzeit einen neuen Versuch starten, sobald du bereit bist.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/billing" className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
            Erneut versuchen
          </Link>
          <Link href="/dashboard" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
