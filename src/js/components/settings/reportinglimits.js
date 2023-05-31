// Copyright 2023 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { ArrowDropDown as ArrowDropDownIcon, ArrowDropUp as ArrowDropUpIcon, Info as InfoIcon } from '@mui/icons-material';
// material ui
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  accordionClasses,
  listSubheaderClasses
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { getReportingLimits } from '../../actions/deviceActions';
import { toggle } from '../../helpers';
import { getFeatures } from '../../selectors';
import { MenderTooltipClickable } from '../common/mendertooltip';

const useStyles = makeStyles()(theme => ({
  accordion: {
    ul: {
      paddingInlineStart: 0
    },
    [`&.${accordionClasses.disabled}, &.${accordionClasses.expanded}`]: {
      backgroundColor: theme.palette.background.paper
    }
  },
  attributesList: {
    overflow: 'auto',
    maxHeight: 250,
    background: 'white',
    width: '100%',
    position: 'relative',
    [`.${listSubheaderClasses.root}`]: {
      top: -10
    },
    'li > ul': {
      overflow: 'initial'
    }
  },
  limitBar: { backgroundColor: theme.palette.grey[500], margin: '15px 0' },
  summary: { padding: 0, marginBottom: theme.spacing() }
}));

export const ReportingLimits = ({ getReportingLimits, config = {}, isHosted = false }) => {
  const [open, setOpen] = useState(false);
  const { classes } = useStyles();
  const { attributes = {}, count = 0, limit = 100 } = config;

  useEffect(() => {
    getReportingLimits();
  }, []);

  const toggleOpen = () => setOpen(toggle);

  const tooltipContent = () => {
    return isHosted ? (
      <div style={{ maxWidth: 350 }}>
        Expand to see the list of attributes currently in use. Please{' '}
        <a href="mailto:contact@mender.io" target="_blank" rel="noopener noreferrer">
          contact our team
        </a>{' '}
        if your use case requires a different set of attributes.
      </div>
    ) : (
      <div style={{ maxWidth: 350 }}>Expand to see the list of attributes currently in use.</div>
    );
  };

  return (
    <>
      <InputLabel className="margin-top" shrink id="filterable-attributes-usage-and-limit">
        Filterable attributes usage & limit ({count}/{limit}){' '}
        <MenderTooltipClickable className="inline-block" style={{ verticalAlign: -5 }} disableHoverListener={false} placement="top" title={tooltipContent()}>
          <InfoIcon />
        </MenderTooltipClickable>
      </InputLabel>
      <Accordion className={classes.accordion} square expanded={open} onChange={toggleOpen} disabled={!count}>
        <AccordionSummary className={classes.summary}>
          <LinearProgress className={classes.limitBar} variant="determinate" value={(count * 100) / limit} style={{ width: '100%' }} />
          <IconButton className="margin-left-small expandButton" size="large">
            {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </IconButton>
        </AccordionSummary>
        <AccordionDetails>
          <List className={classes.attributesList}>
            {Object.entries(attributes).map(([scope, values = []]) => (
              <li key={scope}>
                <ul>
                  <ListSubheader>{scope}</ListSubheader>
                  {values.map(item => (
                    <ListItem key={`item-${scope}-${item}`}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </ul>
              </li>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

const actionCreators = { getReportingLimits };

const mapStateToProps = state => {
  const { isHosted } = getFeatures(state);
  return {
    config: state.devices.filteringAttributesConfig,
    isHosted: isHosted
  };
};

export default connect(mapStateToProps, actionCreators)(ReportingLimits);
