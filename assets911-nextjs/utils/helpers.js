export const formatDate = givenDate => {
  const date = new Date(givenDate)?.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return date;
};

export const formatNumberWithCommas = number => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const createOptions = values => {
  const options = values.map(value => ({ value: value, label: value }));
  return options;
};
