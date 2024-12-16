import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { IATIAidTable } from '../../components/iati/IATIAidTable';
import { COUNTRY_FIELD2, DEFAULT_DONOR, PURPOSE_FIELD2 } from '../../utils/iati/constants';
import { filterDataByDonor, filterDataByPurpose, formatNumber } from '../../utils/data';
import { addFilter, addFilterWrapper } from '../../widgets/filters';

const YEAR = 2023;
const AIDTYPE_FIELD = 'Aid Type Di Name';
const VALUE_FIELD = 'Usd Disbursement Deflated Sum';

const getPurposeNames = (data) => {
  const purposeNames = [];
  data.forEach((record) => {
    if (!purposeNames.includes(record[PURPOSE_FIELD2])) {
      if (typeof record[PURPOSE_FIELD2] !== 'undefined') {
        purposeNames.push(record[PURPOSE_FIELD2]);
      }
    }
  });

  return purposeNames;
};
const filterDataByYear = (data) => data.filter((item) => Number(item.Year) === YEAR);

const getRows = (unfilteredData, data) => {
  const headerRow = [['Aid Type', YEAR, '% Total']];
  const allRowLabels = unfilteredData.reduce((acc, item) => {
    if (!acc.includes(item[AIDTYPE_FIELD])) {
      if ((typeof item[AIDTYPE_FIELD] !== 'undefined') & (item[AIDTYPE_FIELD] !== '')) {
        acc.push(item[AIDTYPE_FIELD]);
      }
    }

    return acc;
  }, []);

  const totalDisbursments = data.map((item) => Number(item[VALUE_FIELD])).reduce((prev, current) => prev + current, 0);
  const rows = allRowLabels.map((label) => {
    const row = data.find((item) => item[AIDTYPE_FIELD] === label);
    const rowValue = row ? row[VALUE_FIELD] : 0;
    const rowPercentage = `${formatNumber((rowValue / totalDisbursments) * 100) || 0}%`;

    return [label].concat(formatNumber(rowValue), [rowPercentage]);
  });

  return headerRow.concat(rows, [['Total', formatNumber(totalDisbursments), totalDisbursments ? '100%' : '0%']]);
};

const renderTable = (tableRoot, data, country, purpose) => {
  const countryData = filterDataByDonor(data, country || DEFAULT_DONOR, COUNTRY_FIELD2);
  const purposeFilteredData = filterDataByPurpose(countryData, purpose, PURPOSE_FIELD2);
  const rows = getRows(data, filterDataByYear(purposeFilteredData));
  tableRoot.render(createElement(IATIAidTable, { country, rows }));
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

          let purposeField;
          let activeCountry = DEFAULT_DONOR;
          if (window.DIState) {
            const tableRoot = createRoot(tableNode);
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { countryIati: country, dataFourIati: data } = state;
              activeCountry = country;
              if (activeCountry && data) {
                const purposeNames = getPurposeNames(data);
                let activePurpose = purposeNames[0];
                if (!purposeField) {
                  const filterWrapper = addFilterWrapper(tableNode);
                  purposeField = addFilter({
                    wrapper: filterWrapper,
                    options: purposeNames,
                    defaultOption: activePurpose,
                    className: 'purpose-code-filter',
                    label: 'Select Purpose Code',
                  });

                  purposeField.addEventListener('change', (event) => {
                    activePurpose = event.target.value;
                    renderTable(tableRoot, data, activeCountry || DEFAULT_DONOR, activePurpose);
                  });
                }

                renderTable(tableRoot, data, activeCountry || DEFAULT_DONOR, activePurpose);
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
