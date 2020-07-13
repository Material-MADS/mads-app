import React from 'react';
import { Button } from 'semantic-ui-react';

import { storiesOf } from '@storybook/react';
// import { action } from '@storybook/addon-actions';
// import { // eslint-disable-line import/no-extraneous-dependencies
//   withKnobs, array,
// } from '@storybook/addon-knobs';

import DefaultSettingDialog from './DefaultSettingDialog';

const stories = storiesOf('DefaultSettingDialog', module);
// stories.addDecorator(withKnobs);

stories.add('default', () => (
  <DefaultSettingDialog trigger={<Button>Show Dialog</Button>} />
));
