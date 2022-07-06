import { filterDataByPurpose, getYearRangeDataAsSum } from './data';

export const extractChartData = (data, purpose, years, valueField, purposeField) => {
  const filteredData = filterDataByPurpose(data, [purpose], purposeField);

  return getYearRangeDataAsSum(filteredData, years, valueField);
};

export const toggleShowChart = (chartNode, show = true) => {
  if (show) {
    chartNode.classList.remove('invisible');
  } else {
    chartNode.classList.add('invisible');
  }
}
