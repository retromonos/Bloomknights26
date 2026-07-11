export async function GetCountyUtilities(county: string, token: string) {
    const res = await fetch("http://localhost:3001/api/utilities/byCounty", {
        body: JSON.stringify({
            county: county
        }),
        method: "POST",
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    return await res.json()
}