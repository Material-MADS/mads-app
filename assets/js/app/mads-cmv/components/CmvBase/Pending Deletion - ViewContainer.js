// /*=================================================================================================
// // Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
// //          Hokkaido University (2018)
// // ________________________________________________________________________________________________
// // Authors: Jun Fujima (Former Lead Developer) [2018-2021]
// //          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// // ________________________________________________________________________________________________
// // Description: This is the Redux Component for the 'ViewContainer' feature/module
// // ------------------------------------------------------------------------------------------------
// // Notes: 'ViewContainer' is the holder component for each visualization components (views) that
// //        can be added into the 'CmvBase' container.
// // ------------------------------------------------------------------------------------------------
// // References: React, prop-types and semantic-ui-react Libs, ColorTags and AddView Containers,
// //             and ViewCatalog (available vizualisation components)
// =================================================================================================*/

// //-------------------------------------------------------------------------------------------------
// // Load required libraries
// //-------------------------------------------------------------------------------------------------
// import React from 'react';
// import PropTypes from 'prop-types';
// import { Button } from 'semantic-ui-react';

// // import Scatter from '../VisComponents/Scatter';
// // import bData from '../VisComponents/testdata/response-ex';

// import style from './style.css';

// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // The Component Class
// //-------------------------------------------------------------------------------------------------
// class ViewContainer extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }

//   componentDidMount() {}

//   render() {
//     const { removeView, id } = this.props;

//     return (
//       <div className="view-container">
//         <Button icon="remove" onClick={() => removeView(id)} />
//         <Button icon="configure" />
//         <Button icon="cocktail" />
//         {/* <Scatter
//           data={bData.data}
//           mappings={{
//             x: 'Formation Energy (eV)',
//             y: 'Band Gap (eV)',
//           }}
//         /> */}
//       </div>
//     );
//   }
// }
// //-------------------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------------
// // The Component propTypes
// //-------------------------------------------------------------------------------------------------
// ViewContainer.propTypes = {
//   id: PropTypes.string.isRequired,
//   removeView: PropTypes.func.isRequired,
// };
// //-------------------------------------------------------------------------------------------------

// export default ViewContainer;
