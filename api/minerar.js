// api/minerar.js
export default async function handler(req, res) {
  // Apenas aceita chamadas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { keyword, apifyToken, actorId } = req.body;

  try {
    // 1. Aciona o robô na Apify
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${apifyToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerms: [keyword], countries: ["BR"], activeStatus: "all" })
    });
    const runData = await runResponse.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    // 2. Espera o robô terminar (Polling a cada 5 segundos)
    let isFinished = false;
    while (!isFinished) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${apifyToken}`);
        const statusData = await statusRes.json();
        
        if (statusData.data.status === 'SUCCEEDED') isFinished = true;
        if (statusData.data.status === 'FAILED') throw new Error("Falha no robô da Apify");
    }

    // 3. Puxa os dados reais da base da Apify e devolve para o ecrã
    const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
    const ads = await datasetRes.json();

    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}