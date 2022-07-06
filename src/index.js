import './styles/styles.css';
// import d3 from 'd3'; // eslint-disable-line import/no-unresolved

// Your Code Goes Here i.e. functions
// set the dimensions and margins of the graph
const margin = {
  top: 10, right: 30, bottom: 30, left: 40,
};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const renderChart = (chartNode) => {
  // append the svg object to the body of the page
  const svg = d3.select(chartNode)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // get the data
  d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv', (data) => {
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.Country))
      .padding(0.2);
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 13000])
      .range([height, 0]);
    svg.append('g')
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.Country))
      .attr('y', (d) => y(d.Value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.Value))
      .attr('fill', '#69b3a2');
  });
};

/**
 * Run your code after the page has loaded
 */
window.addEventListener('load', () => {
  window.DICharts.handler.addChart({
    className: 'dicharts--boilerplate-chart',
    d3: {
      onAdd: (chartNodes) => {
        Array.prototype.forEach.call(chartNodes, (chartNode) => {
          const dichart = new window.DICharts.Chart(chartNode.parentElement);
          dichart.showLoading();
          // dichart.hideLoading();

          /**
           * d3 - prefix all browsers global with window i.e window.d3 - d3 won't work without it
           *
           * const chart = window.d3.select(chartNode);
           */
          renderChart(chartNode);
          dichart.hideLoading();
        });
      },
    },
  });
});
