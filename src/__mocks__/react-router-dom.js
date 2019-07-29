import React from 'react';
import * as rrd from 'react-router-dom';
// Just render plain div with its children
rrd.BrowserRouter = ({ children }) => <div>{children}</div>;
module.exports = rrd;
