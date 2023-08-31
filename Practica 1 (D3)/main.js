//CHART START
//1.aquí hay que poner el código que genera la gráfica
// consts: [fld] Estructura básica del curso
const width = 800
const height = 500
const margin = {
    top: 10,
    right: 10,
    left: 60,
    bottom: 10,
}

// groups: [Básico del curso]
const svg = d3.select("#chart").append("svg").attr("id", "svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("class", "elementGroup")
const axisGroup = svg.append("g").attr("class", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("class", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom - margin.top})`)
const yAxisGroup = axisGroup.append("g").attr("class", "yAxisGroup").attr("transform", `translate(${margin.left}, ${0})`)

// scales & axes:
let x = d3.scaleLinear().range([0, width - margin.left - margin.right])
let y = d3.scaleBand().range([height - margin.top - margin.bottom, 0]).padding(0.1)

const xAxis = d3.axisBottom().scale(x).ticks(5)
const yAxis = d3.axisLeft().scale(y)

let years;
let winners;
let originalData;

// data:
// [FLD]cargamos datos
d3.csv("WorldCup.csv").then(data => {
     // 2. aquí hay que poner el código que requiere datos para generar la gráfica
     //datos para generar la grafica
    data.map(d => {
        d.Year = +d.Year
    })
    data = data.filter(d => d.Winner != "")

    originalData = data
    years = data.map(d => +d.Year)
    winners = d3.nest()
        .key(d => d.Winner)
        .entries(data)

    x.domain([0, d3.max(winners.map(d => d.values.length))])
    y.domain(winners.map(d => d.key))

    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)
    console.log(data)

    // update:
    update(winners)
    slider()
})

// update:
function update(data) {
    // Identificar valores máximos
    let max = d3.max(data.map(d => d.values.length))
    let elements = elementGroup.selectAll("rect").data(data)

    elements.enter()
        .append("rect")
            .attr("class", d => d.values.length == max ? "bar max" : "bar")
            .attr("height", y.bandwidth())
            .attr("x", margin.left)
            .attr("y", d => y(d.key))
            .transition()
                .duration(300)
            .attr("width", d => x(d.values.length))


    elements
    .attr("class", d => d.values.length == max ? "bar max" : "bar")
    .attr("height", y.bandwidth())
    .attr("x", margin.left)
    .attr("y", d => y(d.key))
    .transition()
        .duration(300)
    .attr("width", d => x(d.values.length))


    elements.exit()
        .transition()
            .duration(100)
        .attr("width", 0)
}

// treat data:
function filterDataByYear(Year) {
    //4. función que filtra los datos dependiendo del año que le pasemos (year)
    let updatedData = originalData.filter(d => d.Year <= Year)
    updatedData = d3.nest()
        .key(d => d.Winner)
        .entries(updatedData)

    return updatedData
}
// CHART END

// slider:
function slider() {  
      // esta función genera un slider:
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  //cada cuanto aumenta el slider (4 años)
        .width(580)  // ancho de nuestro slider en px
        .ticks(years.length)
        .default(years[years.length -1])  // punto inicio del marcador
        .on('onchange', val => {
             // 5. AQUÍ SÓLO HAY QUE CAMBIAR ESTO:
             // console.log("La función aún no está conectada con la gráfica")   
             // hay que filtrar los datos según el valor que marquemos en el slider y luego actualizar la gráfica con update
            d3.select('p#value-time').text(val);
            update(filterDataByYear(val))
        });

        // contenedor del slider
        var gTime = d3
        .select('div#slider-time')  // div donde lo insertamos
        .append('svg')
        .attr('width', width * 0.8)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime); // invocamos el slider en el contenedor

        d3.select('p#value-time').text(sliderTime.value()); // actualiza el año que se representa
}