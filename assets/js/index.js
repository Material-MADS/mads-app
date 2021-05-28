import 'semantic-ui-css/semantic.min.css';

// import pages
// import HomePageLayout from 'pages/homePage';

import '../sass/style.scss';

// import 'semantic-ui-css';

import './app/mads-cmv';

import $ from 'jquery';
//
import 'semantic-ui-css';
import 'imports-loader?imports=default|jquery|$!datatables.net';

import './app/css/default.css';

$(document).ready(() => {
  // fix menu when passed
  $('.masthead').visibility({
    once: false,
    onBottomPassed: () => {
      $('.fixed.menu').transition('fade in');
    },
    onBottomPassedReverse: () => {
      $('.fixed.menu').transition('fade out');
    },
  });
  // create sidebar and attach to menu open
  $('.ui.sidebar').sidebar('attach events', '.toc.item');
});
