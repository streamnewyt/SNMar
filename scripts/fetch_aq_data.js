// scripts/fetch_aq_data.js (Versão com Dados de Vento)

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const VOLCANOES = [
    { name: "Kilauea", latitude: 19.4069, longitude: -155.2834 }
];

// Lista de parâmetros que o APP espera
const EXPECTED_PARAMS = [
    "sulphur_dioxide",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "carbon_dioxide",
    "wind_speed_10m",     // <-- ADICIONADO
    "wind_direction_10m"  // <-- ADICIONADO
];
const HOURLY_PARAMS = EXPECTED_PARAMS.join(',');

async function fetchVolcanoAirQuality(volcano) {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${HOURLY_PARAMS}&forecast_days=1`;

    try {
        console.log(`Buscando dados para: ${volcano.name}`);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erro na API para ${volcano.name}: ${response.statusText}`);
        
        const data = await response.json();
        if (!data.hourly || !data.hourly.time) throw new Error(`Resposta da API para ${volcano.name} não contém dados horários.`);

        const sanitizedHourly = {};
        const dataLength = data.hourly.time.length;
        sanitizedHourly.time = data.hourly.time;
        
        EXPECTED_PARAMS.forEach(param => {
            if (data.hourly[param]) {
                sanitizedHourly[param] = data.hourly[param];
            } else {
                console.warn(`AVISO: O parâmetro '${param}' não foi retornado para ${volcano.name}. Usando valores nulos.`);
                sanitizedHourly[param] = Array(dataLength).fill(null);
            }
        });
        
        console.log(`Dados recebidos e validados para: ${volcano.name}`);
        return {
            name: volcano.name,
            latitude: volcano.latitude,
            longitude: volcano.longitude,
            hourly: sanitizedHourly,
            hourly_units: data.hourly_units
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
        if (data) allData.push(data);
    }
    if (allData.length > 0) {
        const outputPath = path.join(__dirname, '..', 'data', 'air-quality.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
        console.log(`Dados salvos com sucesso em: ${outputPath}`);
    } else {
        console.log("Nenhum dado foi buscado.");
    }
    console.log("Processo finalizado.");
}

main();
