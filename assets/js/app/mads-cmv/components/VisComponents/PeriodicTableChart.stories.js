import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, array } from '@storybook/addon-knobs';
import _ from 'lodash';

import PeriodicTable from './PeriodicTableChart';

const stories = storiesOf('PeriodicTable', module);
stories.addDecorator(withKnobs);

stories
  .add('...standard', () => <PeriodicTable />);