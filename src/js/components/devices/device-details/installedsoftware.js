import React from 'react';

import { deepmerge } from '@mui/utils';
import { makeStyles } from 'tss-react/mui';

import { extractSoftware, isEmpty } from '../../../helpers';
import { TwoColumnData } from '../../common/configurationobject';
import DeviceDataCollapse from './devicedatacollapse';

const borderStyle = theme => ({ borderLeft: 'solid 1px', borderLeftColor: theme.palette.grey[500] });

const useStyles = makeStyles()(theme => ({
  paddingOnly: { paddingLeft: theme.spacing(2) },
  nestingBorders: { ...borderStyle(theme), paddingLeft: theme.spacing(2), paddingBottom: theme.spacing(2) },
  topLevelBorder: { ...borderStyle(theme), paddingBottom: theme.spacing(2), marginBottom: theme.spacing(-2) }
}));

const mapLayerInformation = (key, value, i) => {
  const infoItems = key.split('.');
  let priority = i;
  let title = infoItems[0];
  const itemKey = infoItems[infoItems.length - 1];
  let contents = {};
  if (infoItems.length > 2) {
    contents = { content: {}, children: { [infoItems[1]]: mapLayerInformation(infoItems.slice(1).join('.'), value, i + 1) } };
  } else {
    contents = { content: { [itemKey]: value }, children: {} };
  }
  return {
    priority,
    key: infoItems.slice(0, -1).join('.'),
    title,
    ...contents
  };
};

const sortAndHoist = thing =>
  Object.entries(thing)
    .sort((a, b) => a[1].priority - b[1].priority)
    .reduce((accu, entry) => {
      let { children, content, title } = entry[1];
      title = Object.keys(content).reduce(layerTitle => {
        return layerTitle;
      }, title);
      children = sortAndHoist(children);
      if (isEmpty(content) && children.length === 1) {
        title = `${title}.${children[0].title}`;
        content = children[0].content;
        children = [];
      }
      accu.push({ ...entry[1], children, content, title });
      return accu;
    }, []);

/**
 * to get information about the software installed on the device we first need to:
 * - parse the inventory attributes that are likely software references (those with a key ending on '.version')
 * - recursively descend the attribute to create a tree and group software based on shared prefixes
 * - for a shallower tree rendering the resulting tree is descended recursively once more and all
 *    software with only a single "sublayer" is hoisted up & listed under the shared title
 */
export const extractSoftwareInformation = (attributes = {}, sort = true) => {
  const { software } = extractSoftware(attributes);

  const softwareLayers = software.reduce((accu, item, index) => {
    const layer = mapLayerInformation(item[0], item[1], index);
    if (!accu[layer.title]) {
      accu[layer.title] = { content: {}, children: {} };
    }
    accu[layer.title] = {
      ...accu[layer.title],
      ...layer,
      children: deepmerge(accu[layer.title].children, layer.children),
      content: deepmerge(accu[layer.title].content, layer.content),
      priority: accu[layer.title].priority < layer.priority ? accu[layer.title].priority : layer.priority
    };
    return accu;
  }, {});
  if (sort) {
    return sortAndHoist(softwareLayers);
  }
  return softwareLayers;
};

const SoftwareLayer = ({ classes, layer, isNested, overviewOnly, setSnackbar }) => (
  <div className={`margin-top-small ${overviewOnly ? classes.paddingOnly : ''}`}>
    <div className="muted">{layer.title}</div>
    {!isEmpty(layer.content) && (
      <div className={isNested || overviewOnly ? '' : classes.topLevelBorder}>
        <TwoColumnData
          className={`${isNested || overviewOnly ? 'margin-bottom-small' : ''} margin-left-small margin-top-small`}
          config={layer.content}
          compact
          setSnackbar={setSnackbar}
        />
      </div>
    )}
    {!overviewOnly && !!layer.children.length && (
      <div className={classes.nestingBorders}>
        {layer.children.map(child => (
          <SoftwareLayer classes={classes} key={child.key} layer={child} isNested setSnackbar={setSnackbar} />
        ))}
      </div>
    )}
  </div>
);

export const InstalledSoftware = ({ device, setSnackbar }) => {
  const { classes } = useStyles();

  const { attributes = {} } = device;

  let softwareInformation = extractSoftwareInformation(attributes);

  return (
    <DeviceDataCollapse title="Installed software">
      <div className={classes.nestingBorders}>
        {softwareInformation.map(layer => (
          <SoftwareLayer classes={classes} key={layer.key} layer={layer} setSnackbar={setSnackbar} />
        ))}
      </div>
    </DeviceDataCollapse>
  );
};

export default InstalledSoftware;
