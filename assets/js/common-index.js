// import React from 'react';
// import ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';

import 'datatables.net';
import 'datatables.net-dt/css/jquery.dataTables.css';

import $ from 'jquery';
import 'semantic-ui-css';

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

  // test
  $('#table_id').DataTable();
});
// ReactDOM.render(<TestButton />, document.getElementById('react-app'));
