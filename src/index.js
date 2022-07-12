import './styles/styles.css';
import './state';
import initOECD from './core/oecd';
import initIATI from './core/iati';

// Your Code Goes Here i.e. functions

/**
 * Run your code after the page has loaded
 */
window.addEventListener('load', () => {
  initOECD();
  initIATI();
});
