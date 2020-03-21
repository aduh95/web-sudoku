const userLocale =
  navigator.userLanguage ||
  ("languages" in navigator && navigator.languages[0]) ||
  navigator.language ||
  htmlElement.getAttribute("lang");

let i = 1000;
const intlTRFUnits = {
  // second: (i = 1000),
  minute: (i *= 60),
  hour: (i *= 60),
  //   day: (i *= 24),
  //   week: (i *= 7),
  //   month: (i *= 30),
  //   quarter: (i *= 3),
  //   year: (i *= 4),
};

const unitEntries = Object.entries(intlTRFUnits).reverse();

function findRTFUnit(duration) {
  return (unitEntries.find(([unit, threshold]) => duration >= threshold) || [
    "minute",
  ])[0];
}

let rtf;
export default function formatRelativeTime(
  duration,
  outputExactTime = "function" !== typeof Intl.RelativeTimeFormat
) {
  if (outputExactTime) {
    duration /= 1000;
    return `${Math.floor(duration / 3600)}h ${Math.floor(
      (duration % 3600) / 60
    )}min ${Math.floor(duration % 60)}s`;
  } else if (rtf === undefined) {
    rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: "auto" });
  }
  const unit = findRTFUnit(duration);

  return rtf.format(Math.round(-duration / intlTRFUnits[unit]), unit);
}
