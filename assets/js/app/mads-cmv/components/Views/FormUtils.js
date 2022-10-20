/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: A set of Support Utility Functions and constants that helps with configuring the
//              various forms of this application
// ------------------------------------------------------------------------------------------------
// Notes: 'FormUtils' manages often reacuring and needed features for the various forms that are
//         developed and used by the configuration of the different Views.
// ------------------------------------------------------------------------------------------------
// References: None
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Convert Extent Values
// Takes the values (width and height) of the view component and make sure they are valid numbers
//-------------------------------------------------------------------------------------------------
export default function convertExtentValues(values) {
  const newValues = { ...values };

  if (newValues.options && newValues.options.extent) {
    const { width, height } = newValues.options.extent;
    newValues.options.extent.width = isNaN(Number(width)) ? 0 : Number(width);
    newValues.options.extent.height = isNaN(Number(height)) ? 0 : Number(height);
  }

  return newValues;
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Color Map Max
// Keeps track of the maximum available colors for each color map identified by names and provided
// by Bokeh Palettes
//-------------------------------------------------------------------------------------------------
export const cmMax = {
  Category20: "_20", Category20b: "_20", Category20c: "_20", Category10: "_10", Cividis: "256", Inferno: "256", Magma: "256", Plasma: "256", Viridis: "256",
  Turbo: "256", Accent: "8", Blues: "9", BrBG: "11", BuGn: "9", BuPu: "9", GnBu: "9",
  Greens: "9", Greys: "256", OrRd: "9", Oranges: "9", PRGn: "11", Paired: "12", PiYG: "11", PuBu: "9", PuBuGn: "9",
  PuOr: "11", PuRd: "9", Purples: "9", RdBu: "11", RdGy: "11", RdPu: "9", RdYlBu: "11",
  RdYlGn: "11", Reds: "9", Spectral: "11", YlGn: "9", YlGnBu: "9", YlOrBr: "9", YlOrRd: "9", Colorblind: "8",
}
//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Color Map Options
// Keeps track of the names and descriptions for all the available colors provided by Bokeh
// Palettes
//-------------------------------------------------------------------------------------------------
export const colorMapOptions = [
  {key: "Category20", text: "Category20 (max 20 colors)", value: "Category20"},
  {key: "Category20b", text: "Category20b (max 20 colors)", value: "Category20b"},
  {key: "Category20c", text: "Category20c (max 20 colors)", value: "Category20c"},
  {key: "Category10", text: "Category10 (max 10 colors)", value: "Category10"},
  {key: "Cividis", text: "Cividis (max 256 colors)", value: "Cividis"},
  {key: "Inferno", text: "Inferno (max 256 colors)", value: "Inferno"},
  {key: "Magma", text: "Magma (max 256 colors)", value: "Magma"},
  {key: "Plasma", text: "Plasma (max 256 colors)", value: "Plasma"},
  {key: "Viridis", text: "Viridis (max 256 colors)", value: "Viridis"},
  {key: "Turbo", text: "Turbo (max 256 colors)", value: "Turbo"},
  {key: "Accent", text: "Accent (max 8 colors)", value: "Accent"},
  {key: "Blues", text: "Blues (max 9 colors)", value: "Blues"},
  {key: "BrBG", text: "BrBG (max 11 colors)", value: "BrBG"},
  {key: "BuGn", text: "BuGn (max 9 colors)", value: "BuGn"},
  {key: "BuPu", text: "BuPu (max 9 colors)", value: "BuPu"},
  {key: "GnBu", text: "GnBu (max 9 colors)", value: "GnBu"},
  {key: "Greens", text: "Greens (max 9 colors)", value: "Greens"},
  {key: "Greys", text: "Greys (max 256 colors)", value: "Greys"},
  {key: "OrRd", text: "OrRd (max 9 colors)", value: "OrRd"},
  {key: "Oranges", text: "Oranges (max 9 colors)", value: "Oranges"},
  {key: "PRGn", text: "PRGn (max 11 colors)", value: "PRGn"},
  {key: "Paired", text: "Paired (max 12 colors)", value: "Paired"},
  {key: "PiYG", text: "PiYG (max 11 colors)", value: "PiYG"},
  {key: "PuBu", text: "PuBu (max 9 colors)", value: "PuBu"},
  {key: "PuBuGn", text: "PuBuGn (max 9 colors)", value: "PuBuGn"},
  {key: "PuOr", text: "PuOr (max 11 colors)", value: "PuOr"},
  {key: "PuRd", text: "PuRd (max 9 colors)", value: "PuRd"},
  {key: "Purples", text: "Purples (max 9 colors)", value: "Purples"},
  {key: "RdBu", text: "RdBu (max 11 colors)", value: "RdBu"},
  {key: "RdGy", text: "RdGy (max 11 colors)", value: "RdGy"},
  {key: "RdPu", text: "RdPu (max 9 colors)", value: "RdPu"},
  {key: "RdYlBu", text: "RdYlBu (max 11 colors)", value: "RdYlBu"},
  {key: "RdYlGn", text: "RdYlGn (max 11 colors)", value: "RdYlGn"},
  {key: "Reds", text: "Reds (max 9 colors)", value: "Reds"},
  {key: "Spectral", text: "Spectral (max 11 colors)", value: "Spectral"},
  {key: "YlGn", text: "YlGn (max 9 colors)", value: "YlGn"},
  {key: "YlGnBu", text: "YlGnBu (max 9 colors)", value: "YlGnBu"},
  {key: "YlOrBr", text: "YlOrBr (max 9 colors)", value: "YlOrBr"},
  {key: "YlOrRd", text: "YlOrRd (max 9 colors)", value: "YlOrRd"},
  {key: "Colorblind", text: "Colorblind (max 8 colors)", value: "Colorblind"},
];
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Get Dropdown Options
// Takes an array and map it out to be used as a list of options for a Dropdown Field in a form
//-------------------------------------------------------------------------------------------------
export const getDropdownOptions = (list) => list.map((i) => ({ key: i, text: i, value: i }));
//-------------------------------------------------------------------------------------------------
