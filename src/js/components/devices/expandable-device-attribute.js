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

  componentDidMount() {
    const self = this;
    if (self.textContent && self.textContainer) {
      const overflowActive = self.textContent.offsetWidth > self.textContainer.clientWidth;
      self.setState({ overflowActive });
    }
  }

  render() {
    const self = this;
    const { primary, secondary, classes, textClasses } = self.props;
    const defaultClasses = { root: 'attributes', disabled: 'opaque' };
    const currentTextClasses = `${textClasses ? textClasses.secondary : ''} ${self.state.expanded ? 'expanded-attribute' : ''}`;
    let secondaryText = (
      <div className={currentTextClasses} ref={r => (self.textContainer = r)}>
        <span className={currentTextClasses} ref={r => (self.textContent = r)}>
          {secondary}
        </span>{' '}
        {self.state.overflowActive ? <a>show {self.state.expanded ? 'less' : 'more'}</a> : null}
      </div>
    );
    return (
      <div onClick={() => self.setState({ expanded: !self.state.expanded })}>
        <ListItem classes={classes || defaultClasses} disabled={true}>
          <ListItemText
            classes={{ secondary: currentTextClasses }}
            primary={primary}
            secondary={secondaryText}
            secondaryTypographyProps={{ title: secondary, component: 'div' }}
          />
        </ListItem>
        <Divider />
      </div>
    );
  }
}
