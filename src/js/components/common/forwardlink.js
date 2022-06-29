import React from 'react';
import { Link } from 'react-router-dom';

// We need the ref to the <a> element that refers to the deployments tab, in order to align
// the helptip with the button - unfortunately this is not forwarded through react-router or mui
// thus, use the following component as a workaround:
const ForwardingLink = React.forwardRef((props, ref) => <Link {...props} ref={ref} />);
ForwardingLink.displayName = 'ForwardingLink';
export default ForwardingLink;
