import { createRoot } from 'react-dom/client';
import deepMerge from 'deepmerge';
import defaultOptions from '../../charts/echarts';
import { addNoData, extractChartData, removeNoData, toggleShowChart } from '../../utils';
import {
  filterDataByDonor,
  filterDataByPurpose,
  formatNumber,
  getYearRangeDataAsSum,
  getYearsFromRange,
  mapYearToExpectedFormat,
} from '../../utils/data';
import { DEFAULT_DONOR } from '../../utils/iati/constants';
import { addFilter, addFilterWrapper } from '../../widgets/filters';

const AIDTYPE_PURPOSE_FIELD = 'Aid Type Di Name';
const VALUE_FIELD = 'Usd Disbursement Deflated Sum';
const PURPOSE_FIELD = 'Purpose Name';
const DONOR_FIELD = 'Donor Name';
const YEAR_FIELD = 'Year';
const YEAR_RANGE = [2019, 2023];

const getYearSum = (data, purpose, years) => {
  const filteredData = filterDataByPurpose(data, [purpose], AIDTYPE_PURPOSE_FIELD);

  return getYearRangeDataAsSum(filteredData, years, VALUE_FIELD);
};

const groupAidTypeColumns = (chartData) => {
  let chartColumnGroups = {};
  for (let i = 0; i < chartData.length; i++) {
    const chartDataItem = chartData[i];
    for (let k = 0; k < chartDataItem.length; k++) {
      chartColumnGroups[k] = chartColumnGroups[k] ? chartColumnGroups[k] : [];
      chartColumnGroups[k].push(chartDataItem[k]);
    }
  }

  return chartColumnGroups;
};

const getPercentages = (chartData, groupedColumnData) => {
  const dataSums = Object.keys(groupedColumnData).map((item) => {
    return {
      [item]: groupedColumnData[item].reduce((acc, item) => acc + item, 0),
    };
  });

  return chartData.map((item) => {
    return item.map((arr, index) => {
      const numerator = parseFloat(arr);
      const denominator = parseFloat(dataSums[index] ? dataSums[index][index] : 1);
      if (isNaN(numerator) || isNaN(denominator) || numerator === 0 || numerator === 0) {
        return 0;
      } else {
        return (numerator / denominator) * 100;
      }
    });
  });
};

const getSeries = (data, years) => {
  const aidTypes = data.reduce((types, item) => {
    if (!types.includes(item[AIDTYPE_PURPOSE_FIELD])) {
      types.push(item[AIDTYPE_PURPOSE_FIELD]);
    }

    return types;
  }, []);
  const chartData = aidTypes.map((aidType) =>
    extractChartData(data, aidType, years, VALUE_FIELD, AIDTYPE_PURPOSE_FIELD),
  );
  const groupedColumnData = groupAidTypeColumns(chartData);
  const percents = getPercentages(chartData, groupedColumnData);

  return aidTypes.map((barChartCategory, index) => ({
    name: barChartCategory,
    type: 'bar',
    stack: 'oda',
    data: percents[index],
  }));
};

const getTooltipItem = (data, params) => {
  const actualValue = formatNumber(getYearSum(data, params.seriesName, [params.name]));

  return `
    <div style="margin-bottom:8px;">
      ${params.marker}${params.seriesName}:
      <span style="font-weight: bold;">
        ${formatNumber(Number(params.value, 10))}% - US$${actualValue} million
      </span>
    </div>`;
};

const renderChart = (chartNode, noDataNode, noDataRoot, data) => {
  if (!data.length) {
    toggleShowChart(chartNode, false);
    addNoData(noDataNode, noDataRoot);

    return;
  } else {
    toggleShowChart(chartNode);
    removeNoData(noDataNode, noDataRoot);
  }

  const chart = window.echarts.init(chartNode);
  const years = getYearsFromRange(YEAR_RANGE);
  const option = deepMerge(defaultOptions, {
    legend: { show: true, selectedMode: false },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => params.map((param) => getTooltipItem(data, param)).join(''),
    },
    xAxis: {
      type: 'category',
      data: years,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
      },
      max: 100,
    },
    grid: {
      top: 60,
    },
    series: getSeries(data, years),
  });
  option.color = ['#f8c1b2', '#f0826d', '#e84439', '#bc2629', '#8f1b13'].concat(option.color);

  chart.setOption(option, { replaceMerge: ['series'] });
};

const init = (className) => {
  window.DICharts.handler.addChart({
    className,
    echarts: {
      onAdd: (chartNodes) => {
        Array.prototype.forEach.call(chartNodes, (chartNode) => {
          const dichart = new window.DICharts.Chart(chartNode.parentElement);

          const defaultCountry = DEFAULT_DONOR;
          dichart.showLoading();
          const filterWrapper = addFilterWrapper(chartNode);
          const noDataNode = addFilterWrapper(chartNode);

          const noDataRoot = createRoot(noDataNode);

          let purposeField;
          let activePurpose = 'Reproductive health care';
          if (window.DIState) {
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { countryIati: country, dataFourIati: data } = state;
              if (country && data) {
                const countryData = mapYearToExpectedFormat(
                  filterDataByPurpose(
                    filterDataByDonor(data, country || defaultCountry, DONOR_FIELD),
                    [activePurpose],
                    PURPOSE_FIELD,
                  ),
                  YEAR_FIELD,
                );
                if (!purposeField) {
                  purposeField = addFilter({
                    wrapper: filterWrapper,
                    options: data.reduce((options, prev) => {
                      const value = prev[PURPOSE_FIELD];
                      if (value && !options.includes(value)) {
                        return options.concat(value);
                      }

                      return options;
                    }, []),
                    defaultOption: activePurpose,
                    className: 'purpose-code-filter',
                    label: 'Select purpose code',
                  });
                  purposeField.addEventListener('change', (event) => {
                    activePurpose = event.target.value;
                    const { countryIati: country } = window.DIState.getState;
                    const countryData = mapYearToExpectedFormat(
                      filterDataByPurpose(
                        filterDataByDonor(data, country || defaultCountry, DONOR_FIELD),
                        [activePurpose],
                        PURPOSE_FIELD,
                      ),
                      YEAR_FIELD,
                    );
                    renderChart(chartNode, noDataNode, noDataRoot, countryData);
                  });
                }
                renderChart(chartNode, noDataNode, noDataRoot, countryData);

                dichart.hideLoading();
              }
            });
          } else {
            console.log('State is not defined');
            dichart.hideLoading();
          }
        });
      },
    },
  });
};

export default init;
