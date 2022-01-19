/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: Adjusts the main area content to the menu bar after its been injected on the start
//              index of the 'Analysis' page, as well as make the side menu be openable and
//              closable.
// ------------------------------------------------------------------------------------------------
// Notes: basically manages the main menu interaction
// ------------------------------------------------------------------------------------------------
// References: semantic ui css, jquery
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import 'semantic-ui-css/semantic.min.css';
import 'datatables.net-dt/css/jquery.dataTables.css';
import $ from 'jquery';
import 'semantic-ui-css';
import 'imports-loader?imports=default|jquery|$!datatables.net';

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
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
//-------------------------------------------------------------------------------------------------
