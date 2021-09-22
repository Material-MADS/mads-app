// import React from 'react';
// import ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';
import 'datatables.net-dt/css/jquery.dataTables.css';

import $ from 'jquery';

//
import 'semantic-ui-css';
import 'imports-loader?imports=default|jquery|$!datatables.net';

$(() => {
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
  $('#table_id').DataTable();
});
// ReactDOM.render(<TestButton />, document.getElementById('react-app'));
