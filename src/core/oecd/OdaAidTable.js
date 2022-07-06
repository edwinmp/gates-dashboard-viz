import { createElement } from 'react';
import { render } from 'react-dom';
import { OdaAidTable } from '../../components/OdaAidTable';
import { COUNTRY_FIELD, DEFAULT_COUNTRY, PURPOSE_FIELD, NO_DATA, YEARsingle, AIDTYPE_FIELD, VALUE_FIELD_AIDTYPE } from '../../utils/constants';
import { filterDataByCountry, filterDataByPurpose, formatNumber } from '../../utils/data';
import { addFilter, addFilterWrapper } from '../../widgets/filters';
// import d3 from 'd3'; // eslint-disable-line import/no-unresolved

const getPurposeNames = (data, purposeField = PURPOSE_FIELD) => {
  const purposeNames = [];
  data.forEach((record) => {
    if (record[purposeField] && !purposeNames.includes(record[purposeField])) {
      purposeNames.push(record[purposeField]);
    }
  });

  return purposeNames;
};
const filterDataByYear = (data) => data.filter((item) => `${item.year}` === `${YEARsingle}`);

const getRows = (unfilteredData, data) => {
  const headerRow = [['Aid Type', YEARsingle, '% Total']];
  const allRowLabels = unfilteredData.reduce((acc, item) => {
    const aidType = item[AIDTYPE_FIELD];
    if(aidType && !acc.includes(aidType)) {
      acc.push(aidType);
    }

    return acc;
  }, []);
  const totalDisbursments = data.map((item) => Number(item[VALUE_FIELD_AIDTYPE])).reduce((prev, current) => prev + current, 0);
  const rows = allRowLabels.map((label) => {
    const row = data.find((item) => item[AIDTYPE_FIELD] === label);
    const rowValue = row ? row[VALUE_FIELD_AIDTYPE] : NO_DATA;
    const rowPercentage = rowValue !== NO_DATA ? `${(formatNumber((rowValue / totalDisbursments)*100) || 0)}%` : NO_DATA;

    return [label].concat(formatNumber(rowValue, 0), [rowPercentage]);
  });

  return headerRow.concat(rows, [['Total', formatNumber(totalDisbursments, 0), totalDisbursments ? '100%' : '0%']]);
};

const renderTable = (tableNode, data, country, purpose) => {
  const countryData = filterDataByCountry(data, country || DEFAULT_COUNTRY, COUNTRY_FIELD);
  const purposeFilteredData = filterDataByPurpose(countryData, purpose, PURPOSE_FIELD);
  const rows = getRows(data, filterDataByYear(purposeFilteredData));
  render(createElement(OdaAidTable, { country, rows }), tableNode);
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
          let activeCountry = DEFAULT_COUNTRY;
          if (window.DIState) {
            window.DIState.addListener(() => {
              dichart.showLoading();
              const state = window.DIState.getState;
              const { country, odaAidType: data } = state;
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
                    label: 'Select purpose code',
                  });

                  purposeField.addEventListener('change', (event) => {
                    activePurpose = event.target.value;
                    renderTable(tableNode, data, activeCountry || DEFAULT_COUNTRY, activePurpose);
                  });
                }

                renderTable(tableNode, data, activeCountry || DEFAULT_COUNTRY, activePurpose);
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
