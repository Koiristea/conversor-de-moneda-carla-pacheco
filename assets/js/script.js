const apiURL = "https://mindicador.cl/api";
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const chartCanvas = document.getElementById("chart-js");
let chartInstance;

document.getElementById("convert").addEventListener("click", async () => {
  const amount = document.getElementById("amount").value;
  const coin = document.getElementById("coin").value;

  resultDiv.textContent = "";
  errorDiv.textContent = "";

  if (amount <= 0) {
    errorDiv.textContent = "El monto no se puede procesar";
    return;
  }

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("No se pudieron recibir los datos de la API");
    }

    const data = await response.json();
    const conversionRate = data[coin].valor;
    const convertedValue = (amount / conversionRate).toFixed(2);

    let currencySymbol = '';
    if (coin === 'dolar') {
        currencySymbol = '$';
    } else if (coin === 'euro') {
        currencySymbol = '€';
    }

    resultDiv.textContent = `Resultado: ${currencySymbol} ${convertedValue}`;

    renderChart(data[coin]);
  } catch (error) {
    errorDiv.textContent = `Error de cálculo: ${error.message}`;
  }
});

async function renderChart(coinData) {
  const historyEndpoint = `${apiURL}/${coinData.codigo}`;

  try {
    const response = await fetch(historyEndpoint);

    if (!response.ok) {
      throw new Error(
        "No se logró recibir el historial de la moneda."
      );
    }

    const data = await response.json();
    const labels = data.serie
      .slice(0, 10)
      .map((entry) => entry.fecha.split("T")[0]);
    const values = data.serie.slice(0, 10).map((entry) => entry.valor);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: labels.reverse(),
        datasets: [
          {
            label: `Historial de los últimos 10 días (${coinData.nombre})`,
            data: values.reverse(),
            borderColor: "rgb(40, 112, 166)",
            borderWidth: 4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    color: "white",
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "white",
                }
            },

            y: {
                ticks: {
                    color: "white",
                }
            }
        }
      },
    });
} catch (error) {
    errorDiv.textContent = `Error al cargar las gráficas: ${error.message}`;
  }
}
