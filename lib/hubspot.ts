interface ContactParams {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  venueLocation: string
}

export async function upsertHubSpotContact({ email, firstName, lastName, phone, venueLocation }: ContactParams) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) return

  const properties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    [process.env.HUBSPOT_VENUE_PROPERTY ?? 'golf_ranch_location']: venueLocation,
  }
  if (phone) properties.phone = phone

  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputs: [{ idProperty: 'email', properties }],
    }),
  })

  if (!res.ok) {
    console.error('HubSpot upsert failed:', await res.text())
  }
}
