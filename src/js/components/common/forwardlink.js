import React from 'react';
import { Link } from 'react-router-dom';

const ForwardingLink = React.forwardRef((props, ref) => <Link {...props} innerRef={ref} />);
ForwardingLink.displayName = 'ForwardingLink';
export default ForwardingLink;
