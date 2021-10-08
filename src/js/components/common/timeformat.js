import moment from 'moment';

export function LocaleFormatString(stripTime = false) {
  console.log(moment.locale());
  if (stripTime) {
    return moment().creationData().locale._longDateFormat.L;
  }
  return moment().creationData().locale._longDateFormat.L + ' ' + moment().creationData().locale._longDateFormat.LT;
}

export default LocaleFormatString;
