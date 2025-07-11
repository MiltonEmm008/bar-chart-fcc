import "./style.css";
import * as d3 from "d3";

console.log(d3 ? "d3" : "");

document.addEventListener("DOMContentLoaded", async () => {
  // Tipo DataGDP: cada objeto tiene una fecha y un valor de gdp
  type DataGDP = {
    date: string;
    gdp: number;
  };

  // Variables para margenes y tamano del grafico
  let data: DataGDP[] = [];
  const margin = { top: 50, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="container">
    <h1 id="title">Grafico de barras GDP</h1>
    <!-- SVG para el grafico -->
    <svg id="chart"></svg>
    <!-- Tooltip flotante -->
    <div id="tooltip"></div>
    <p>Por <a href="https://github.com/MiltonEmm008/bar-chart-fcc" target="_blank">Milton</a></p>
  </div>
`;


  // Obtener los datos de GDP desde un JSON remoto
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  if (!response.ok) return;
  const json = (await response.json()) as { data: [string, number][] };
  // Convertir el array de arrays a array de objetos
  data = json.data.map((value) => ({ date: value[0], gdp: value[1] }));
  console.log(data); // Mostrar datos en consola


  // Seleccionar el SVG y ajustar su tamano, luego agregar un grupo (g) con margen
  const svg = d3
    .select<SVGAElement, unknown>("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


  // xScale: scaleBand para eje categorico (fechas)
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.date))
    .range([0, width])
    .padding(0.1); // 0.1 = 10% de espacio entre barras


  // yScale: escala lineal para valores de GDP
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.gdp)!])
    .range([height, 0]);


  // xAxis: mostrar solo algunos ticks para evitar saturacion, mostrar solo el anio
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xScale.domain().filter((_, i) => i % 20 === 0))
    .tickFormat((d) => d.slice(0, 4));


  // Dibujar el eje x en la parte inferior
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  // Dibujar el eje y a la izquierda
  svg.append("g").attr("id", "y-axis").call(d3.axisLeft(yScale));


  // Dibujar una barra por cada dato
  svg
    .selectAll<SVGRectElement, DataGDP>("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.date)!) // posicion horizontal
    .attr("y", (d) => yScale(d.gdp))   // posicion vertical (arriba de la barra)
    .attr("width", xScale.bandwidth()) // ancho de la barra
    .attr("height", (d) => height - yScale(d.gdp)) // alto de la barra
    .attr("data-date", (d) => d.date)
    .attr("data-gdp", (d) => d.gdp.toString());


  // Seleccionar el div del tooltip
  const tooltip = d3.select<HTMLDivElement, unknown>("#tooltip");


  // Eventos del tooltip para las barras
  svg
    .selectAll<SVGRectElement, DataGDP>(".bar")
    .on("mouseover", (_, d) => {
      // Mostrar tooltip con fecha y GDP
      tooltip
        .style("visibility", "visible")
        .attr("data-date", d.date)
        .text(`${d.date} — $${d.gdp} B`);
    })
    .on("mousemove", (e) => {
      // Mover tooltip con el mouse
      tooltip
        .style("top", `${e.pageY - 10}px`)
        .style("left", `${e.pageX + 10}px`);
    })
    .on("mouseout", () => {
      // Ocultar tooltip
      tooltip.style("visibility", "hidden");
    });
});
