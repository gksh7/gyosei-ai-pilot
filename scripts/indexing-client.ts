import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/indexing']

export async function notifyIndexing(url: string): Promise<void> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
  const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
  const client = await auth.getClient()

  const res = await (client as ReturnType<typeof google.auth.fromJSON>).request({
    url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
    method: 'POST',
    data: { url, type: 'URL_UPDATED' },
  })

  console.log(`📡 Indexing API通知完了: ${url} → status ${(res as { status: number }).status}`)
}
