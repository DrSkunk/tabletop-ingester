import React, { useEffect, useRef, useState } from 'react';

export default function PointPicker() {
  let [imgSize, setImgSize] = useState({ width: 100, height: 100 });
  let [croppedSize, setCroppedSize] = useState({ width: 100, height: 100 });
  let [points, setPoints] = useState([
    [66, 193],
    [540, 189],
    [546, 1055],
    [77, 1060],
  ]);

  let [activeCorner, setActiveCorner] = useState(null);

  let img = useRef(null);

  // useEffect(() => {
  //   let { width, height } = img.current.getBoundingClientRect();
  //   setImgSize({ width, height });
  // }, [img]);

  const sendPoints = () => {
    fetch('http://localhost:8558/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points,
        imgSize,
      }),
    });
  };

  const handleLoad = () => {
    let { width, height } = img.current.getBoundingClientRect();
    setImgSize({ width, height });
  };

  useEffect(() => {
    const handle = (event) => {
      let { pageX, pageY } = event;
      setPoints((existing) => {
        let clone = existing.slice();
        clone[activeCorner] = [pageX, pageY];
        return clone;
      });
    };
    window.addEventListener('mousemove', handle);
    return () => {
      window.removeEventListener('mousemove', handle);
    };
  }, [activeCorner]);

  return (
    <div>
      <div className="relative h-screen w-screen flex items-start">
        <img
          ref={img}
          alt=""
          src="http://localhost:8558/api/crop"
          className="h-full z-0"
          onLoad={handleLoad}
        />
        <svg
          width={imgSize.width}
          height={imgSize.height}
          viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
          className="absolute inset-0 z-10 h-full bg-transparent"
          onMouseUp={() => setActiveCorner(null)}
        >
          <polyline
            className="text-blue-500 text-opacity-75"
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            // Insert first point as the last point as well to close the shape
            points={[...points, points[0]].map(([x, y]) => `${x},${y}`).join(' ')}
          />
          {points.map(([x, y], i) => (
            <circle
              key={i} // Don't worry about it...
              cx={x}
              cy={y}
              // Decrease the size just a little so that you can pin point it pretty nicely
              r={activeCorner === i ? 2 : 6}
              className="text-blue-500"
              fill="white"
              strokeWidth={4}
              stroke="currentColor"
              onMouseDown={() => setActiveCorner(i)}
            />
          ))}
        </svg>
        <div className="m-2">
          <button
            className="bg-blue-500 text-white rounded px-4 py-2 mb-2 hover:bg-blue-400"
            onClick={sendPoints}
          >
            Send points
          </button>
          <div>
            <div className="mb-2">
              Presets:{' '}
              <button className="bg-blue-500 text-white rounded px-4 py-2 mx-2 hover:bg-blue-400">
                Unlock!
              </button>
              <button className="bg-blue-500 text-white rounded px-4 py-2 mx-2 hover:bg-blue-400">
                Pocket Escape Room
              </button>
            </div>

            <label className="block">
              Width:
              <input
                type="number"
                className=""
                onChange={setCroppedSize}
                value={croppedSize.width}
              />
            </label>
            <label className="block">
              Height:
              <input
                type="number"
                className=""
                onChange={setCroppedSize}
                value={croppedSize.height}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
