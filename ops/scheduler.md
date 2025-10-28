# Cloud Scheduler Setup

Dieses Beispiel zeigt, wie du einen täglichen Trigger für `/jobs/fetch-ads` einrichtest, der per OIDC gegen deinen Worker authentifiziert und die Parameter `searchTerm="shoes"` sowie `country="DE"` übergibt.

## Voraussetzungen

- Ersetze alle Platzhalter (`PROJECT_ID`, `REGION`, `WORKER_URL`, `SERVICE_ACCOUNT_EMAIL`, `OIDC_AUDIENCE`) durch deine Werte.
- Der angegebene Service Account benötigt die Rolle `roles/iam.serviceAccountTokenCreator`, um OIDC-Tokens auszustellen.

## Job einmalig erstellen

```bash
gcloud scheduler jobs create http fetch-ads-daily \
  --project=PROJECT_ID \
  --location=REGION \
  --schedule="0 6 * * *" \
  --time-zone="UTC" \
  --uri="https://WORKER_URL/jobs/fetch-ads" \
  --http-method=POST \
  --headers='Content-Type=application/json' \
  --body='{"searchTerm":"shoes","country":"DE"}' \
  --oidc-service-account-email=SERVICE_ACCOUNT_EMAIL \
  --oidc-token-audience=OIDC_AUDIENCE
```

> Hinweis: `OIDC_AUDIENCE` entspricht in der Regel der vollständigen URL deines Cloud-Run-Services (`https://WORKER_URL`).

## Job testen

Hole dir ein OIDC-Token und sende eine Testanfrage an den Worker:

```bash
ID_TOKEN=$(gcloud auth print-identity-token \
  --audiences=OIDC_AUDIENCE \
  --include-email)

curl -X POST "https://WORKER_URL/jobs/fetch-ads" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"searchTerm":"shoes","country":"DE"}'
```

Bei erfolgreicher Authentifizierung sollte der Worker die bekannten Fetch-Ads-Jobs ausführen und eine entsprechende JSON-Antwort liefern.
