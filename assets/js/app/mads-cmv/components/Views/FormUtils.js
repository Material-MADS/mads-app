export default function convertExtentValues(values) {
  const newValues = { ...values };

  if (newValues.options && newValues.options.extent) {
    const { width, height } = newValues.options.extent;
    newValues.options.extent.width = Number(width);
    newValues.options.extent.height = Number(height);
  }

  return newValues;
}
