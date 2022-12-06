import path from 'path';

const processSvg = filename => {
  let componentName = path.parse(filename).name.replace(/[^a-z]/gi, '');
  componentName = componentName[0].toUpperCase() + componentName.slice(1);
  return `const React = require('react');
const Component = React.forwardRef((props, ref) => ({
  $$typeof: Symbol.for('react.element'),
  type: 'svg',
  ref,
  props: { ...props, id: '${componentName}' }
}));
module.exports = { __esModule: true, default: Component, Component };`;
};

export default {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    let code = `module.exports = ${assetFilename};`;
    if (filename.endsWith('.svg')) {
      code = processSvg(filename);
    }

    return { code };
  }
};
