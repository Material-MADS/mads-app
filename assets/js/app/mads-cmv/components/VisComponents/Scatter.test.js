import React from 'react';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { render, waitFor } from '@testing-library/react';

import Scatter from './Scatter';

expect.extend({ toMatchImageSnapshot });

import data from './testdata/data-ex';

test('test Scatter with simple data', async () => {
  const { container, getByTestId } = render(
    <Scatter
      data={data}
      mappings={{
        x: 'Formation Energy (eV)',
        y: 'Band Gap (eV)',
      }}
    />
  );

  await waitFor(() => container.querySelector('canvas'));

  const canvas = container.querySelector('canvas');
  const img = canvas.toDataURL();

  const imgData = img.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(imgData, 'base64');
  expect(buf).toMatchImageSnapshot({
    failureThreshold: 0.001,
    failureThresholdType: 'percent',
  });
});
