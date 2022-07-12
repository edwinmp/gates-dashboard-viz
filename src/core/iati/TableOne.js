import { createElement } from 'react';
import { render } from 'react-dom';
import { TableOne } from '../../components/TableOne/TableOne';
import { COUNTRY_FIELD, DEFAULT_DONOR, PURPOSE_FIELD, PURPOSE_TO_FILTER_BY, VALUE_FIELD, YEARS } from '../../utils/iati';
import { filterDataByDonor, filterDataByPurpose, formatNumber, getYearsFromRange } from '../../utils/data';


const renderTable = (tableNode, data, country) => {
  const years = getYearsFromRange(YEARS);
  const headerRow = ['Purpose code'].concat(years);

  const rows = [headerRow].concat(
    PURPOSE_TO_FILTER_BY.map((purpose) => {
      const purposeData = filterDataByPurpose(data, [purpose], PURPOSE_FIELD);

      return headerRow.reduce((row, column, index) => {
        if (index === 0) {
          return row.concat(purpose);
        }
        const yearData = purposeData.filter((d) => parseFloat(d.year) === column);
        const sum = yearData.reduce((_sum, prev) => _sum + Number(prev[VALUE_FIELD]), 0);

        return row.concat(formatNumber(sum));
      }, []);
    }),
  );

  render(createElement(TableOne, { country, rows }), tableNode);
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

          if (window.DIState) {
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { countryIati: country, dataOneIati: data } = state;

              if (country && data) {
                const countryData = filterDataByPurpose(
                  filterDataByDonor(data, country || DEFAULT_DONOR, COUNTRY_FIELD),
                  PURPOSE_TO_FILTER_BY,
                  PURPOSE_FIELD,
                );
                renderTable(tableNode, countryData, country || DEFAULT_DONOR);
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
