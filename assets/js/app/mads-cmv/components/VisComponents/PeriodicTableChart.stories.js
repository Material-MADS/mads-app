import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, array } from '@storybook/addon-knobs';

import PeriodicTable from './PeriodicTableChart';

const stories = storiesOf('PeriodicTable', module);
stories.addDecorator(withKnobs);

stories
  .add('...standard', () => <PeriodicTable />);
