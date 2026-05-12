import { google } from 'googleapis'

const SITE_URL = 'https://gyosei-ai-pilot.com/'

export type GscRow = {
  keys: string[]
  impressions: number
  clicks: number
  ctr: number
  position: number
}

export function createGscClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
  return google.webmasters({ version: 'v3', auth })
}

async function query(
  client: ReturnType<typeof createGscClient>,
  dimensions: string[],
  days = 28,
): Promise<GscRow[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  const { data } = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      dimensions,
      rowLimit: 1000,
    },
  })
  return (data.rows ?? []) as GscRow[]
}

export const fetchPageRows = (client: ReturnType<typeof createGscClient>) =>
  query(client, ['page'])

export const fetchQueryRows = (client: ReturnType<typeof createGscClient>) =>
  query(client, ['query'])
