import React, { useEffect, useRef, useState } from 'react';
import exampleImage from './example.jpg';

export default function App() {
  let canvas = useRef(null);

  // const [width, setWidth] = useState(0);
  // const [height, setHeight] = useState(0);

  // function draw() {}

  // useLayoutEffect(() => {
  //   const context = canvas.current.getContext('2d');

  //   // some canvas stuff..
  //   context.beginPath();
  //   context.moveTo(0, height / 2);
  //   context.lineTo(width, height / 2);
  //   context.stroke();
  // }, [width, height]);

  // useEffect(() => {
  //   const resizeCanvas = () => {
  //     console.log('resizing', window.innerWidth, window.innerHeight);
  //     setWidth(window.innerWidth);
  //     setHeight(window.innerHeight);
  //     draw();
  //   };
  //   window.addEventListener('resize', resizeCanvas, false);

  //   resizeCanvas();
  // }, [canvas]);

  useEffect(() => {
    const context = canvas.current.getContext('2d');
    const myimage = new Image();
    myimage.onload = function () {
      const ratio = myimage.naturalWidth / myimage.naturalHeight;
      console.log(ratio, 'ratio');
      context.drawImage(myimage, 0, 0, window.innerHeight * ratio, window.innerHeight);
    };
    myimage.src = exampleImage;
  }, [canvas]);

  return (
    <div>
      <canvas ref={canvas} width={window.innerWidth / 2} height={window.innerHeight}></canvas>
    </div>
  );
  // return <div>Tabeltop Ingester</div>;
}
