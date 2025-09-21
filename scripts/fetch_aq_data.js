// scripts/fetch_aq_data.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Lista de vulcões que queremos monitorar. Começando com Kilauea.
// Futuramente, você pode adicionar mais vulcões aqui!
const VOLCANOES = [
    { name: "Kilauea", latitude: 19.4069, longitude: -155.2834 }
    // { name: "Poás", latitude: 10.2, longitude: -84.23 },
    // { name: "Etna", latitude: 37.75, longitude: 14.99 }
];

// Os gases que queremos da API
const HOURLY_PARAMS = [
    "sulphur_dioxide",
    "carbon_monoxide",
    "nitrogen_dioxide"
].join(',');

async function fetchVolcanoAirQuality(volcano) {
    const apiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${HOURLY_PARAMS}&forecast_days=1`;

    try {
        console.log(`Buscando dados para: ${volcano.name}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na API para ${volcano.name}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(`Dados recebidos para: ${volcano.name}`);
        return {
            name: volcano.name,
            latitude: volcano.latitude,
            longitude: volcano.longitude,
            hourly: data.hourly
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
        // O caminho para salvar o arquivo de dados
        const outputPath = path.join(__dirname, '..', 'data', 'air-quality.json');
        
        // Garante que a pasta 'data' exista
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Salva os dados no arquivo
        fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
        console.log(`Dados salvos com sucesso em: ${outputPath}`);
    } else {
        console.log("Nenhum dado foi buscado. O arquivo não será atualizado.");
    }

    console.log("Processo finalizado.");
}

main();
