// scripts/fetch_aq_data.js (Versão Final com 2 API Calls)

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Arquivo: scripts/fetch_aq_data.js

const VOLCANOES = [
    // Américas
    { name: "Popocatépetl", latitude: 19.0236, longitude: -98.6225 }, // México
    { name: "Fuego", latitude: 14.473, longitude: -90.88 }, // Guatemala
    { name: "Reventador", latitude: -0.0775, longitude: -77.6561 }, // Equador
    { name: "Kilauea", latitude: 19.4069, longitude: -155.2834 }, // EUA (Havaí)
    { name: "Villarrica", latitude: -39.42, longitude: -71.93 }, // Chile

    // Europa
    { name: "Etna", latitude: 37.751, longitude: 14.9934 }, // Itália
    { name: "Stromboli", latitude: 38.789, longitude: 15.213 }, // Itália

    // Ásia-Pacífico
    { name: "Aso", latitude: 32.884, longitude: 131.104 }, // Japão
    { name: "Sakurajima", latitude: 31.585, longitude: 130.657 }, // Japão
    { name: "Semeru", latitude: -8.108, longitude: 112.922 }, // Indonésia
    { name: "Lewotolo", latitude: -8.272, longitude: 123.505 }, // Indonésia
    { name: "Ibu", latitude: 1.488, longitude: 127.63 }, // Indonésia
    { name: "Dukono", latitude: 1.693, longitude: 127.878 }, // Indonésia

    // África
    { name: "Nyiragongo", latitude: -1.52, longitude: 29.25 }, // RD Congo

    // Rússia
    { name: "Shiveluch", latitude: 56.653, longitude: 161.36 }, // Kamchatka
    { name: "Ebeko", latitude: 50.686, longitude: 156.014 }, // Ilhas Curilas
    { name: "Karymsky", latitude: 54.05, longitude: 159.45 } // Kamchatka
];


// Parâmetros para cada API
const AIR_QUALITY_PARAMS = ["sulphur_dioxide", "carbon_monoxide", "nitrogen_dioxide", "carbon_dioxide"];
const WEATHER_PARAMS = ["wind_speed_10m", "wind_direction_10m"];

async function fetchVolcanoData(volcano) {
    const aqApiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${AIR_QUALITY_PARAMS.join(',')}&forecast_days=1`;
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${WEATHER_PARAMS.join(',')}&forecast_days=1`;

    try {
        console.log(`Buscando dados para: ${volcano.name}`);
        
        // Faz as duas chamadas em paralelo
        const [aqResponse, weatherResponse] = await Promise.all([
            fetch(aqApiUrl).then(res => res.json()),
            fetch(weatherApiUrl).then(res => res.json())
        ]);

        if (aqResponse.error) throw new Error(`Erro na API de Qualidade do Ar: ${aqResponse.reason}`);
        if (weatherResponse.error) throw new Error(`Erro na API de Clima: ${weatherResponse.reason}`);
        if (!aqResponse.hourly || !aqResponse.hourly.time) throw new Error(`Resposta de Qualidade do Ar inválida.`);

        // Combina os resultados
        const combinedHourly = { ...aqResponse.hourly, ...weatherResponse.hourly };
        const combinedUnits = { ...aqResponse.hourly_units, ...weatherResponse.hourly_units };

        const sanitizedHourly = {};
        const dataLength = combinedHourly.time.length;
        sanitizedHourly.time = combinedHourly.time;
        
        const allExpectedParams = [...AIR_QUALITY_PARAMS, ...WEATHER_PARAMS];
        allExpectedParams.forEach(param => {
            if (combinedHourly[param]) {
                sanitizedHourly[param] = combinedHourly[param];
            } else {
                console.warn(`AVISO: O parâmetro '${param}' não foi retornado para ${volcano.name}.`);
                sanitizedHourly[param] = Array(dataLength).fill(null);
            }
        });
        
        console.log(`Dados combinados com sucesso para: ${volcano.name}`);
        return {
            name: volcano.name, latitude: volcano.latitude, longitude: volcano.longitude,
            hourly: sanitizedHourly,
            hourly_units: combinedUnits
        };

    } catch (error) {
        console.error(`Falha ao buscar dados para ${volcano.name}:`, error.message);
        return null;
    }
}

async function main() {
    console.log("Iniciando a busca de dados...");
    const allData = [];
    for (const volcano of VOLCANOES) {
        const data = await fetchVolcanoData(volcano);
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
