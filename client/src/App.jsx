import React from 'react';
import Names from './Names';
import PointPicker from './PointPicker';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');

  if (page === 'names') {
    return <Names />;
  }
  if (page === 'crop') {
    return <PointPicker />;
  }
  return <div>Invalid page given.</div>;
}
