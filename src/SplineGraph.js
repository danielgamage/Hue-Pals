import React, {useRef} from 'react';
import logo from './logo.svg';
import { observer } from 'mobx-react';
import state from './state'
import styled from 'styled-components'
import {
  line, curveBundle,
} from 'd3-shape'
import {scaleLinear} from "d3-scale";

const Styles = styled.div`
position: relative;
.rainbow {
  width: calc(100% + 0.4rem);
  margin-left: -0.2rem;
  height: 100%;
  position: absolute;
  border-radius: 4px;
  z-index: -1;
  background: linear-gradient(to bottom,
    hsl(720, 100%, 30%),
    hsl(680, 100%, 30%),
    hsl(640, 100%, 30%),
    hsl(600, 100%, 30%),
    hsl(560, 100%, 30%),
    hsl(520, 100%, 30%),
    hsl(480, 100%, 30%),
    hsl(440, 100%, 30%),
    hsl(400, 100%, 30%),
    hsl(360, 100%, 30%),
    hsl(320, 100%, 30%),
    hsl(280, 100%, 30%),
    hsl(240, 100%, 30%),
    hsl(200, 100%, 30%),
    hsl(160, 100%, 30%),
    hsl(120, 100%, 30%),
    hsl(80,  100%, 30%),
    hsl(40,  100%, 30%),
    hsl(0,   100%, 30%)
  );
}
.splineGraph {
  overflow: visible;
  width: 8rem;
  height: 100%;
  vector-effect: non-scaling-stroke;
  background: var(--gray-10);
  border-radius: 4px;
  box-shadow:
    0 0 0 1px var(--gray-9),
    var(--box-shadow);

  path, line, circle {
    stroke-width: 1px;
    fill: none;
    vector-effect: non-scaling-stroke;
    mix-blend-mode: lighten;
    stroke-linecap: round;
  }
  line {
    stroke: var(--gray-5)
  }
  path {
    stroke: var(--gray-2)
  }
  .point {
    fill: transparent;
    stroke-width: 2px;

    &--oncurve {
      stroke: var(--gray-2);
      fill: var(--gray-9);
    }
    &--offcurve {
      stroke: var(--gray-6);
    }
  }
}
`

let isMouseDown = false;
let initialMouse, initial, selectedNode, svgBounds, scaleX, scaleY;

const SplineGraph = observer(({
  spline,
  color,
  onSplineUpdate,
  max,
  min,
  width,
  height = 1,
  onStartUpdate,
  onEndUpdate,
  hue
}) => {
  const svgRef = useRef(null)

  const handleMouseDown = (e, index) => {
    // right click
    if (e.button === 2) return

    isMouseDown = true
    selectedNode = index
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseEnd)
    window.addEventListener('mouseleave', handleMouseEnd)

    initialMouse = {x: e.clientX, y: e.clientY}
    svgBounds = svgRef.current.getBoundingClientRect()
    scaleX = scaleLinear()
      .domain([svgBounds.x, svgBounds.x + svgBounds.width])
      .range([0, 1])
      .clamp(true)
    scaleY = scaleLinear()
      .domain([svgBounds.y, svgBounds.y + svgBounds.height])
      .range([max, min])
      .clamp(true)
  }
  const handleMouseMove = (e) => {
    if (isMouseDown) {
      const mouse = {x: e.clientX, y: e.clientY}
      let newSpline = [...spline].splice(2, spline.length - 2)

      switch (selectedNode) {
        case 'start-oncurve':
          onStartUpdate(scaleY(mouse.y))
          break;
        case 'start':
          newSpline[0] = scaleX(mouse.x)
          newSpline[1] = scaleY(mouse.y)
          onSplineUpdate(newSpline)
          break;
        case 'end-oncurve':
          onEndUpdate(scaleY(mouse.y))
          break;
        case 'end':
          newSpline[2] = scaleX(mouse.x)
          newSpline[3] = scaleY(mouse.y)
          onSplineUpdate(newSpline)
          break;
        default:
          break;
      }
    }
  }
  const handleMouseEnd = (e) => {
    isMouseDown = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseEnd)
    window.removeEventListener('mouseleave', handleMouseEnd)
  }

  const graphScaleY = scaleLinear()
    .domain([min, max])
    .range([height, 0])

  const scaledS = spline.map((el, i) => (
    i % 2 === 0
      ? el
      : graphScaleY(el)
  ))

  return (
    <Styles className="SplineGraph" height={height}>
      {hue && <div className="rainbow" />}
      <svg className="splineGraph" viewBox={`0 0 1 ${height}`} ref={svgRef}>
        <path d={`
        M ${scaledS[0]}, ${scaledS[1]}
        C ${scaledS[2]}, ${scaledS[3]}
          ${scaledS[4]}, ${scaledS[5]}
          ${scaledS[6]}, ${scaledS[7]}
        `}
        />
        <line x1={scaledS[0]} y1={scaledS[1]} x2={scaledS[2]} y2={scaledS[3]} />
        <circle className="point point--oncurve" cx={scaledS[0]} cy={scaledS[1]} r="0.075"
          onMouseDown={(e) => {handleMouseDown(e, 'start-oncurve')}}
        />
        <circle className="point point--offcurve" cx={scaledS[2]} cy={scaledS[3]} r="0.075"
          onMouseDown={(e) => {handleMouseDown(e, 'start')}}
        />

        <line x1={scaledS[4]} y1={scaledS[5]} x2={scaledS[6]} y2={scaledS[7]} />
        <circle className="point point--oncurve" cx={scaledS[6]} cy={scaledS[7]} r="0.075"
          onMouseDown={(e) => {handleMouseDown(e, 'end-oncurve')}}
        />
        <circle className="point point--offcurve" cx={scaledS[4]} cy={scaledS[5]} r="0.075"
          onMouseDown={(e) => {handleMouseDown(e, 'end')}}
        />
      </svg>
    </Styles>
  );
})

export default SplineGraph;
