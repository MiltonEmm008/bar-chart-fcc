import "./style.css";
import * as d3 from "d3";

console.log(d3 ? "d3" : "");

document.addEventListener("DOMContentLoaded", async () => {
  type DataGDP = {
    date: string;
    gdp: number;
  };

  let data: DataGDP[] = [];
  const margin = { top: 50, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1 id="title">Grafico de barras GDP</h1>

    <svg id="chart"></svg>

    <div id="tooltip"></div>

    <p>Por <a href="" target="_blank">Milton</a></p>
  </div>
`;

  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );

  if (!response.ok) return;

  const json = (await response.json()) as { data: [string, number][] };

  data = json.data.map((value) => ({ date: value[0], gdp: value[1] }));

  console.log(data);

  const parseDate = d3.timeParse("%Y-%m-%d");

  const svg = d3
    .select<SVGAElement, unknown>("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => parseDate(d.date)!) as [Date, Date])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.gdp)!])
    .range([height, 0]);

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(10));

  svg.append("g").attr("id", "y-axis").call(d3.axisLeft(yScale));

  svg
    .selectAll<SVGRectElement, DataGDP>("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(parseDate(d.date)!))
    .attr("y", (d) => yScale(d.gdp))
    .attr("width", width / data.length)
    .attr("height", (d) => height - yScale(d.gdp))
    .attr("data-date", (d) => d.date)
    .attr("data-gdp", (d) => d.gdp.toString());

  const tooltip = d3.select<HTMLDivElement, unknown>("#tooltip");

  svg
    .selectAll<SVGRectElement, DataGDP>(".bar")
    .on("mouseover", (e, d) => {
      tooltip
        .style("visibility", "visible")
        .attr("data-date", d.date)
        .text(`${d.date} — $${d.gdp} B`);
    })
    .on("mousemove", (e) => {
      console.log(e)
      tooltip
        .style("top", `${e.pageY - 10}px`)
        .style("left", `${e.pageX + 10}px`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
});
