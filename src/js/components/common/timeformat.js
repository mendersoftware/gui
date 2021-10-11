import moment from 'moment';
// import { getUserSettings } from '../../selectors';

export function LocaleFormatString(stripTime) {
  // Get the saved user locale
  console.log('Current user locale: ' + moment.locale());
  // const { locale = 'automatic' } = getUserSettings();
  // console.log('Stored locale: ' + locale);
  var curLocale = moment.localeData('de');
  if (stripTime) {
    return curLocale.longDateFormat('L');
  }
  return curLocale.longDateFormat('L') + ' ' + curLocale.longDateFormat('LT');
}

export default LocaleFormatString;
