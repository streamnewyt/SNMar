// scripts/fetch_aq_data.js (Versão Robusta)

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const VOLCANOES = [
    { name: "Kilauea", latitude: 19.4069, longitude: -155.2834 }
    // { name: "Poás", latitude: 10.2, longitude: -84.23 },
    // { name: "Etna", latitude: 37.75, longitude: 14.99 }
];

// Mantenha a lista de gases que o APP espera aqui como referência
const EXPECTED_GASES = [
    "sulphur_dioxide",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "carbon_dioxide"
];
const HOURLY_PARAMS = EXPECTED_GASES.join(',');

async function fetchVolcanoAirQuality(volcano) {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${HOURLY_PARAMS}&forecast_days=1`;

    try {
        console.log(`Buscando dados para: ${volcano.name}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na API para ${volcano.name}: ${response.statusText}`);
        }
        const data = await response.json();

        // --- INÍCIO DA LÓGICA DE SEGURANÇA ---
        // Se a API não retornar a seção 'hourly', não podemos fazer nada.
        if (!data.hourly || !data.hourly.time) {
            throw new Error(`Resposta da API para ${volcano.name} não contém dados horários ('hourly.time').`);
        }

        const sanitizedHourly = {};
        const dataLength = data.hourly.time.length;

        // Garante que o tempo e as unidades sempre existam
        sanitizedHourly.time = data.hourly.time;
        
        // Verifica cada gás esperado
        EXPECTED_GASES.forEach(gas => {
            if (data.hourly[gas]) {
                // O gás existe na resposta, então o usamos.
                sanitizedHourly[gas] = data.hourly[gas];
            } else {
                // O gás NÃO existe, então criamos um array de 'null' do mesmo tamanho.
                console.warn(`AVISO: O gás '${gas}' não foi retornado pela API para ${volcano.name}. Usando valores nulos.`);
                sanitizedHourly[gas] = Array(dataLength).fill(null);
            }
        });
        // --- FIM DA LÓGICA DE SEGURANÇA ---

        console.log(`Dados recebidos e validados para: ${volcano.name}`);
        return {
            name: volcano.name,
            latitude: volcano.latitude,
            longitude: volcano.longitude,
            hourly: sanitizedHourly, // <-- Usa o objeto 'hourly' seguro e completo
            hourly_units: data.hourly_units // Mantém as unidades
        };
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function main() {
    console.log("Iniciando a busca de dados de qualidade do ar...");
    const allData = [];

    for (const volcano of VOLCANOES) {
        const data = await fetchVolcanoAirQuality(volcano);
        if (data) {
            allData.push(data);
        }
    }

    if (allData.length > 0) {
        const outputPath = path.join(__dirname, '..', 'data', 'air-quality.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
        console.log(`Dados salvos com sucesso em: ${outputPath}`);
    } else {
        console.log("Nenhum dado foi buscado. O arquivo não será atualizado.");
    }

    console.log("Processo finalizado.");
}

main();
