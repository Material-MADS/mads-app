import React from 'react';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { render, waitFor } from '@testing-library/react';

import BarChart from './BarChart';

expect.extend({ toMatchImageSnapshot });

const data0 = {
  fruits: ['Apples', 'Pears', 'Nectarines', 'Plums', 'Grapes', 'Strawberries'],
  2015: [2, 1, 4, 3, 2, 4],
  2016: [5, 3, 3, 2, 4, 6],
  2017: [3, 2, 4, 4, 5, 3],
};

test('test BarChart with simple data', async () => {
  const { container, getByTestId } = render(
    <BarChart
      data={data0}
      mappings={{ dimension: 'fruits', measures: ['2015', '2016', '2017'] }}
      // mappings={{ dimension: 'fruits', measures: ['2017'] }}
      options={{ legendLocation: 'top_left' }}
    />
  );

  await waitFor(() => container.querySelector('canvas'));

  const canvas = container.querySelector('canvas');
  const img = canvas.toDataURL();

  const data = img.replace(/^data:image\/\w+;base64,/, '');
  const buf = Buffer.from(data, 'base64');
  expect(buf).toMatchImageSnapshot({
    failureThreshold: 0.001,
    failureThresholdType: 'percent',
  });
});
