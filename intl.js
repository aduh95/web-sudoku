const userLocale =
  navigator.userLanguage ||
  ("languages" in navigator && navigator.languages[0]) ||
  navigator.language ||
  htmlElement.getAttribute("lang");

export const rtf = new Intl.RelativeTimeFormat(userLocale, { numeric: "auto" });

let i = 1000;
export const intlTRFUnits = {
  minute: (i *= 60),
  hour: (i *= 60),
  //   day: (i *= 24),
  //   week: (i *= 7),
  //   month: (i *= 30),
  //   quarter: (i *= 3),
  //   year: (i *= 4),
};

const unitEntries = Object.entries(intlTRFUnits).reverse();

export function findRTFUnit(duration) {
  return (unitEntries.find(([unit, threshold]) => duration >= threshold) || [
    "minute",
  ])[0];
}
