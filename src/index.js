import './styles/styles.css';
import './state';
// import { fetchCoreData } from './utils/data';
import initOECD from './core/oecd';

// Your Code Goes Here i.e. functions

/**
 * Run your code after the page has loaded
 */
window.addEventListener('load', () => {
  initOECD();
});
