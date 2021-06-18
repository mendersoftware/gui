import React from 'react';

export const Loader = ({ fade, show, small, style, table, waiting }) => {
  const hideClass = fade ? 'hidden' : 'loaderContainer shrunk';
  const showClass = table ? 'miniLoaderContainer' : 'loaderContainer';
  return (
    <div style={style} className={show ? showClass : hideClass}>
      <div className={`${small ? 'small' : ''} ${waiting ? 'waiting-loader' : ''} loader`}>
        <span className="dot dot_1" />
        <span className="dot dot_2" />
        <span className="dot dot_3" />
        <span className="dot dot_4" />
      </div>
    </div>
  );
};

export default Loader;
