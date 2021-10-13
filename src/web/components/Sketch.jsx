import { useRef, useEffect } from 'react'
import p5 from 'p5'
import styled from '@emotion/styled'

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
})

const Sketch = () => {
  const canvasParentEl = useRef()
  const p5Instance = useRef()

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(400, 400)
      }

      p.draw = () => {
        p.background(220)
      }
    }
    if (p5Instance.current) {
      p5Instance.current.remove()
    }

    p5Instance.current = new p5(sketch, canvasParentEl.current)

    return () => {
      p5Instance.current.remove()
    }
  }, [])

  return <Container ref={canvasParentEl} />
}

export default Sketch
