import React from 'react';
import PropTypes from 'prop-types';
import Table from './Table';

const OdaChannelsTable = (props) => {
  const renderRows = (rows, header = false) =>
    rows.map((row, index) => (
      <tr key={index}>{row.map((cell, key) => (header ? <th key={key}>{cell}</th> : <td key={key}>{cell}</td>))}</tr>
    ));

  return (
    <Table>
      <thead>
        {renderRows(
          props.rows.filter((row, index) => index === 0),
          true,
        )}
      </thead>
      <tbody>{renderRows(props.rows.filter((row, index) => index > 0))}</tbody>
    </Table>
  );
};

OdaChannelsTable.propTypes = {
  country: PropTypes.string,
  rows: PropTypes.arrayOf(PropTypes.array),
};

export default OdaChannelsTable;
