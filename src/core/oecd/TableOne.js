import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { TableOne } from '../../components/TableOne/TableOne';
import { COUNTRY_FIELD, PURPOSE_FIELD, PURPOSE_TO_FILTER_BY, YEARS } from '../../utils/constants';
import {
  filterDataByCountry,
  filterDataByPurpose,
  formatNumber,
  getYearRangeData,
  getYearsFromRange,
} from '../../utils/data';
// import d3 from 'd3'; // eslint-disable-line import/no-unresolved

// Your Code Goes Here i.e. functions
const VALUE_FIELD = 'usd_disbursement_deflated_Sum';

const renderTable = (tableRoot, data, country) => {
  const years = getYearsFromRange(YEARS);
  const headerRow = ['Purpose code'].concat(years);
  const dataRows = PURPOSE_TO_FILTER_BY.map((purpose) => {
    const purposeData = filterDataByPurpose(data, [purpose], PURPOSE_FIELD);

    return [purpose].concat(getYearRangeData(purposeData, years, VALUE_FIELD));
  });
  const totalsRowCaption = 'Total';
  const totalsRow = headerRow.map((cell, index) => {
    if (index === 0) {
      return totalsRowCaption;
    }

    return formatNumber(
      dataRows.reduce((total, current) => (typeof current[index] === 'number' ? total + current[index] : total), 0),
    );
  });
  // formatting is done after calculating the total to eliminate rounding errors
  const formattedDataRow = dataRows.map((row) =>
    row.map((cell) => (typeof cell === 'number' ? formatNumber(cell) : cell)),
  );

  const rows = [headerRow].concat(formattedDataRow, [totalsRow]);

  tableRoot.render(createElement(TableOne, { country, rows }));
};

/**
 * Run your code after the page has loaded
 */
const init = (className) => {
  window.DICharts.handler.addChart({
    className,
    d3: {
      onAdd: (tableNodes) => {
        Array.prototype.forEach.call(tableNodes, (tableNode) => {
          const dichart = new window.DICharts.Chart(tableNode.parentElement);
          dichart.showLoading();

          const defaultCountry = 'United States';
          if (window.DIState) {
            const tableRoot = createRoot(tableNode);

            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { country, dataOne: data } = state;
              if (country && data) {
                const countryData = filterDataByPurpose(
                  filterDataByCountry(data, country || defaultCountry, COUNTRY_FIELD),
                  PURPOSE_TO_FILTER_BY,
                  PURPOSE_FIELD,
                );
                renderTable(tableRoot, countryData, country || defaultCountry);
                dichart.hideLoading();
                tableNode.parentElement.classList.add('auto-height');
              }
            });
          } else {
            console.log('State is not defined');
          }
        });
      },
    },
  });
};

export default init;
