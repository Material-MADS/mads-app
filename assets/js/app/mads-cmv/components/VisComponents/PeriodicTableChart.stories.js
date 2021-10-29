import React from 'react';
import { storiesOf } from '@storybook/react';

import PeriodicTable from './PeriodicTableChart';

const stories = storiesOf('PeriodicTable', module);

stories
  .add('...standard', () => <PeriodicTable />);
