interface ContactParams {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  locationName: string
}

// Maps event location_name to HubSpot's "location" dropdown internal values
const VENUE_MAP: Record<string, string> = {
  'Richardson': 'Richardson',
  "Lee's Summit": "Lee's Summit",
  'Shoal Creek': 'Shoal Creek',
  'Brookfield': 'Brookfield',
  'Grand Prairie': 'Golf Ranch - Grand Prairie',
  'Glendale': 'Golf Ranch - Glendale',
}

export async function upsertHubSpotContact({ email, firstName, lastName, phone, locationName }: ContactParams) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) return

  const hubspotVenue = VENUE_MAP[locationName]
  if (!hubspotVenue) {
    console.error(`No HubSpot venue mapping found for location: ${locationName}`)
    return
  }

  const properties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    location: hubspotVenue,
  }
  if (phone) properties.phone = phone

  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputs: [{ idProperty: 'email', id: email, properties }],
    }),
  })

  if (!res.ok) {
    console.error('HubSpot upsert failed:', await res.text())
  }
}
