import React from 'react';
import { compose, setDisplayName } from 'recompose';
import * as rrd from 'react-router-dom';
// Just render plain div with its children
// eslint-disable-next-line no-import-assign
rrd.BrowserRouter = compose(setDisplayName('BrowserRouter'))(({ children }) => <div>{children}</div>);

module.exports = rrd;
