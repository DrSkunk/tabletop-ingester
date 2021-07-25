import React, { useRef, useState } from 'react';

export default function Names() {
  const [spritesheetWidth, setSpritesheetWidth] = useState(0);
  const [spritesheetHeight, setSpritesheetHeight] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [names, setNames] = useState(Array(60).fill(''));
  const svgHeight = window.innerHeight;

  const cardWidth = spritesheetWidth / 10;
  const cardHeight = spritesheetHeight / 7;

  const image = useRef(null);

  const sendNames = () => {
    fetch('http://localhost:8558/api/names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    });
  };

  const onLoad = () => {
    const { width, height } = image.current.getBoundingClientRect();
    setSpritesheetWidth(width);
    setSpritesheetHeight(height);
  };

  return (
    <div className="h-screen flex flex-row">
      <div className="h-full">
        <svg width={spritesheetWidth} height={svgHeight}>
          <image
            onLoad={onLoad}
            ref={image}
            x={0}
            y={0}
            height={svgHeight}
            href="http://localhost:8558/api/spritesheet"
          />
          <rect
            x={cardWidth * (cardIndex % 10)}
            y={cardHeight * Math.floor(cardIndex / 10)}
            width={cardWidth}
            height={cardHeight}
            fill="none"
            stroke="red"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="inline p-2">
        <div className="grid grid-cols-10">
          {names.map((name, index) => (
            <input
              key={index}
              className="w-full"
              type="text"
              value={name}
              autoFocus={index === 0}
              onSelect={() => setCardIndex(index)}
              onChange={(e) => {
                const newNames = names.slice();
                newNames[index] = e.target.value;
                setNames(newNames);
              }}
            />
          ))}
        </div>
        <button className="mt-2 p-3 bg-blue-400 rounded hover:bg-blue-300" onClick={sendNames}>
          Send names
        </button>
      </div>
    </div>
  );
}
