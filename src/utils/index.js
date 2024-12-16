import { createElement } from 'react';
import NoData from '../components/NoData';

export const addNoData = (element, rootNode) => {
  element.classList.add('no-data--wrapper');
  rootNode.unmount();
  rootNode.render(createElement(NoData));
};

export const removeNoData = (element, rootNode) => {
  element.classList.remove('no-data--wrapper');
  rootNode.unmount();
};

export * from './constants';
export * from './chart';
