/* eslint-disable import/no-extraneous-dependencies */

import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({ adapter: new Adapter() });
window.MessageChannel = require('worker_threads').MessageChannel;
