import React from 'react';

// material ui
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export default class ExpandableDeviceAttribute extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      expanded: false,
      overflowActive: false
    };
  }

  componentDidUpdate() {
    const self = this;
    if (self.textContent) {
      const overflowActive = self.textContent.scrollWidth > self.textContent.clientWidth || self.textContent.scrollHeight > self.textContent.clientHeight;
      if (self.state.overflowActive !== overflowActive && !self.state.expanded) {
        self.setState({ overflowActive });
      }
    }
  }

  render() {
    const self = this;
    const { primary, secondary, classes, textClasses } = self.props;
    const defaultClasses = { root: 'attributes' };
    const currentTextClasses = `${textClasses ? textClasses.secondary : ''} ${self.state.expanded && self.state.overflowActive ? 'expanded-attribute' : ''}`;
    let secondaryText = (
      <div>
        <span className={currentTextClasses} ref={r => (self.textContent = r)} style={self.state.overflowActive ? { marginBottom: '-0.5em' } : {}}>
          {secondary}
        </span>{' '}
        {self.state.overflowActive ? <a>show {self.state.expanded ? 'less' : 'more'}</a> : null}
      </div>
    );
    return (
      <div onClick={() => self.setState({ expanded: !self.state.expanded })}>
        <ListItem classes={classes || defaultClasses} disabled={true}>
          <ListItemText primary={primary} secondary={secondaryText} secondaryTypographyProps={{ title: secondary, component: 'div' }} />
        </ListItem>
        <Divider />
      </div>
    );
  }
}
