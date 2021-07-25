import React, { useState } from 'react';
import Draggable from 'react-draggable';
import exampleImage from './example.jpg';

function Point({ position, setPosition, index }) {
  //   const [position, setPosition] = useState({ x: 0, y: 0 });
  // return <div className="">test</div>;

  function eventLogger(e, data) {
    // console.log('Event: ', e);
    // console.log('Data: ', data.x, data.y);
    setPosition(index, { x: data.x, y: data.y });
  }

  const nodeRef = React.useRef(null);
  return (
    <Draggable
      position={position}
      onStart={eventLogger}
      onDrag={eventLogger}
      onStop={eventLogger}
      ref={nodeRef}
    >
      <rect width="20" height="20" className="fill-current text-green-600" ref={nodeRef} />
    </Draggable>
  );
}

export default Point;
