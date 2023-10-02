/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Adjusts the main area content to the menu bar after its been injected on the
//              vizualising component index of the 'Analysis' page, as well as make the side menu
//              be openable and closable.
// ------------------------------------------------------------------------------------------------
// Notes: basically manages the main menu interaction
// ------------------------------------------------------------------------------------------------
// References: semantic ui css, jquery and the mads-cmv app
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
import 'semantic-ui-css/semantic.min.css';
import './app/mads-cmv';
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
});
//-------------------------------------------------------------------------------------------------
