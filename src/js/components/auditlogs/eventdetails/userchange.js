import React from 'react';

const getDiffLineStyle = line => {
  if (line.startsWith('+ ')) {
    return 'green';
  } else if (line.startsWith('- ')) {
    return 'red';
  }
  return '';
};

export const UserChange = ({ item }) => (
  <div className="code flexbox column">
    {item.change.split('\n').map((line, index) => (
      <span key={`line-${index}`} className={getDiffLineStyle(line)}>
        {line}
      </span>
    ))}
  </div>
);

export default UserChange;
