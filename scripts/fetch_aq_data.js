// scripts/fetch_aq_data.js (Versão Completa e Corrigida)

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const VOLCANOES = [
    // Américas
    { name: "Popocatépetl", latitude: 19.0236, longitude: -98.6225 }, // México
    { name: "Fuego", latitude: 14.473, longitude: -90.88 }, // Guatemala
    { name: "Reventador", latitude: -0.0775, longitude: -77.6561 }, // Equador
    { name: "Kilauea", latitude: 19.4069, longitude: -155.2834 }, // EUA (Havaí)
    { name: "Villarrica", latitude: -39.42, longitude: -71.93 }, // Chile
    { name: "Poás", latitude: 10.19751, longitude: -84.23084 }, // Costa Rica

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
    { name: "Krakatau", latitude: -6.1024, longitude: 105.4231 }, // Indonésia


    // África
    { name: "Nyiragongo", latitude: -1.52, longitude: 29.25 }, // RD Congo

    // Rússia
    { name: "Shiveluch", latitude: 56.653, longitude: 161.36 }, // Kamchatka
    { name: "Ebeko", latitude: 50.686, longitude: 156.014 }, // Ilhas Curilas
    { name: "Karymsky", latitude: 54.05, longitude: 159.45 } // Kamchatka
];

const AIR_QUALITY_PARAMS = ["sulphur_dioxide", "carbon_monoxide", "nitrogen_dioxide", "carbon_dioxide"];
const WEATHER_PARAMS = ["wind_speed_10m", "wind_direction_10m"];

async function fetchVolcanoData(volcano) {
    const aqApiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${AIR_QUALITY_PARAMS.join(',')}&forecast_days=1`;
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${volcano.latitude}&longitude=${volcano.longitude}&hourly=${WEATHER_PARAMS.join(',')}&forecast_days=1`;

    try {
        console.log(`Buscando dados para: ${volcano.name}`);
        
        const [aqResponse, weatherResponse] = await Promise.all([
            fetch(aqApiUrl).then(res => res.json()),
            fetch(weatherApiUrl).then(res => res.json())
        ]);

        if (aqResponse.error) throw new Error(`Erro na API de Qualidade do Ar: ${aqResponse.reason}`);
        if (weatherResponse.error) throw new Error(`Erro na API de Clima: ${weatherResponse.reason}`);
        if (!aqResponse.hourly || !aqResponse.hourly.time) throw new Error(`Resposta de Qualidade do Ar inválida.`);

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
    console.log("Iniciando a busca de dados para todos os vulcões em paralelo...");
    
    // Cria um array de promessas, uma para cada vulcão
    const promises = VOLCANOES.map(volcano => fetchVolcanoData(volcano));
    
    // Executa todas as buscas ao mesmo tempo e aguarda a conclusão
    const results = await Promise.all(promises);
    
    // Filtra apenas os resultados que foram bem-sucedidos (não nulos)
    const volcanoData = results.filter(data => data !== null);
    
    if (volcanoData.length > 0) {
        // Cria um objeto final que "envelopa" os dados dos vulcões.
        const finalDataObject = {
            lastUpdated: new Date().toISOString(), // Adiciona a data e hora exata da execução
            volcanoes: volcanoData // Adiciona a lista de vulcões
        };

        const outputPath = path.join(__dirname, '..', 'data', 'air-quality.json');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        
        // Salva o novo objeto completo no arquivo JSON.
        fs.writeFileSync(outputPath, JSON.stringify(finalDataObject, null, 2));
        
        console.log(`Dados de ${volcanoData.length} vulcões salvos com sucesso em: ${outputPath}`);
    } else {
        console.log("Nenhum dado foi buscado com sucesso.");
    }
    console.log("Processo finalizado.");
}

main();
