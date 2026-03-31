# 🌋 Verificador de Gases Vulcânicos

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue.svg)

Este projeto coleta e organiza dados de **qualidade do ar** e **condições climáticas** em tempo real para diversos vulcões ativos ao redor do mundo.  
Os dados são obtidos de APIs abertas e armazenados em formato JSON para análise e visualização.

---

## ✨ Funcionalidades
- Consulta automática de parâmetros de qualidade do ar:
  - Dióxido de enxofre (SO₂)
  - Monóxido de carbono (CO)
  - Dióxido de nitrogênio (NO₂)
  - Dióxido de carbono (CO₂)
- Consulta de parâmetros climáticos:
  - Velocidade do vento
  - Direção do vento
- Processamento paralelo para múltiplos vulcões.
- Salvamento dos resultados em `data/air-quality.json`.

---

## 🌍 Vulcões monitorados
- Popocatépetl (México)
- Fuego (Guatemala)
- Reventador (Equador)
- Kilauea (Havaí, EUA)
- Villarrica (Chile)
- Poás (Costa Rica)
- Etna e Stromboli (Itália)
- Aso e Sakurajima (Japão)
- Semeru, Lewotolo, Ibu, Dukono, Krakatau (Indonésia)
- Nyiragongo (RD Congo)
- Shiveluch, Ebeko, Karymsky (Kamchatka, Rússia)

---

## ⚙️ Como usar
1. Clone este repositório:
   ```bash
   git clone https://github.com/streamnewyt/seurepositorio.git
Instale as dependências:

bash
npm install node-fetch
Execute o script:

bash
node scripts/fetch_aq_data.js
Os dados serão salvos em:

Código
/data/air-quality.json
📂 Estrutura
Código
/scripts
  └── fetch_aq_data.js   # Script principal
/data
  └── air-quality.json   # Saída dos dados
📜 Licença
Este projeto está licenciado sob a MIT License – você pode usar, modificar e distribuir livremente, desde que mantenha os créditos.

⚠️ Aviso
Os dados são obtidos de fontes abertas (Open Meteo API).

Não há garantias de disponibilidade ou precisão absoluta.

Este projeto é apenas para fins de pesquisa e consulta.

🙌 Contribuições
Sinta-se à vontade para abrir issues e enviar pull requests. Toda ajuda é bem-vinda!
