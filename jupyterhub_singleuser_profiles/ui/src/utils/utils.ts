const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_MONTH = MS_PER_DAY * 30;
const MS_PER_YEAR = MS_PER_DAY * 365;

const formatReturnTime = (count: number, unit: string, singlePrefix = 'a'): string => {
  if (count <= 1) {
    return `about ${singlePrefix} ${unit} ago`;
  }
  return `about ${count} ${unit}s ago`;
};

export const timeSince = (time: string): string => {
  const elapsed = Date.now() - Date.parse(time);

  if (elapsed < MS_PER_MINUTE) {
    return formatReturnTime(Math.round(elapsed / 1000), 'second');
  } else if (elapsed < MS_PER_HOUR) {
    return formatReturnTime(Math.round(elapsed / MS_PER_MINUTE), 'minute');
  } else if (elapsed < MS_PER_DAY) {
    return formatReturnTime(Math.round(elapsed / MS_PER_HOUR), 'hour', 'an');
  } else if (elapsed < MS_PER_MONTH) {
    return formatReturnTime(Math.round(elapsed / MS_PER_DAY), 'day');
  } else if (elapsed < MS_PER_YEAR) {
    return formatReturnTime(Math.round(elapsed / MS_PER_MONTH), 'month');
  }
  return formatReturnTime(Math.round(elapsed / MS_PER_YEAR), 'year');
};
