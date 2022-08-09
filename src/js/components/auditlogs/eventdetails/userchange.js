import React from 'react';
import { Code } from '../../common/copy-code';

const getDiffLineStyle = line => {
  if (line.startsWith('+ ')) {
    return 'green';
  } else if (line.startsWith('- ')) {
    return 'red';
  }
  return '';
};

export const UserChange = ({ item }) => (
  <Code className="flexbox column">
    {item.change.split('\n').map((line, index) => (
      <span key={`line-${index}`} className={getDiffLineStyle(line)}>
        {line}
      </span>
    ))}
  </Code>
);

export default UserChange;
