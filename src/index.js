import deepMerge from 'deepmerge';
import './styles/styles.css';
// import d3 from 'd3'; // eslint-disable-line import/no-unresolved

const defaultOptions = {
  legend: {
    top: 10,
    textStyle: {
      fontFamily: 'Geomanist Regular,sans-serif',
    },
  },
  tooltip: {
    trigger: 'axis',
    textStyle: {
      fontFamily: 'Geomanist Regular,sans-serif',
    },
  },
  toolbox: {
    showTitle: false,
    feature: {
      saveAsImage: {
        title: 'Save as image',
        pixelRatio: 2,
      },
    },
    right: 20,
    tooltip: {
      show: true,
      textStyle: {
        fontFamily: 'Geomanist Regular,sans-serif',
        formatter(param) {
          return `<div>${param.title}</div>`; // user-defined DOM structure
        },
      },
    },
  },
  xAxis: {
    axisLabel: {
      fontFamily: 'Geomanist Regular,sans-serif',
      fontSize: 13,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    axisLabel: {
      fontFamily: 'Geomanist Regular,sans-serif',
      fontSize: 13,
    },
    splitLine: {
      show: false,
    },
  },
};

// Your Code Goes Here i.e. functions
const renderChart = (chartNode) => {
  // append the svg object to the body of the page

  // get the data
  window.d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv', (data) => {
    // X axis
    // console.log(data.map((d) => d));
    const chart = window.echarts.init(chartNode);
    const option = {
      yAxis: {
        type: 'category',
        data: data.map((d) => d.Country),
      },
      xAxis: {
        type: 'value',
      },
      series: [{
        data: data.map((d) => Number(d.Value)),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)',
        },
      }],
    };
    chart.setOption(deepMerge(defaultOptions, option));
  });
};
/**
 * Run your code after the page has loaded
 */
window.addEventListener('load', () => {
  window.DICharts.handler.addChart({
    className: 'dicharts--boilerplate-chart',
    echarts: {
      onAdd: (chartNodes) => {
        Array.prototype.forEach.call(chartNodes, (chartNode) => {
          const dichart = new window.DICharts.Chart(chartNode.parentElement);
          // dichart.showLoading();

          /**
           * ECharts - prefix all browsers global with window
           * i.e window.echarts - echarts won't work without it
           *
           * const chart = window.echarts.init(chartNode);
           */
          renderChart(chartNode.parentElement);
          dichart.hideLoading();
        });
      },
    },
  });
});
