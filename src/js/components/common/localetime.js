import React from 'react';
import Time from 'react-time';
import LocaleFormatString from './timeformat';

export function LocaleTime(props) {
  return <Time {...props} format={LocaleFormatString()} />;
}
export default LocaleTime;
