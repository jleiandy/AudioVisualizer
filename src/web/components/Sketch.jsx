import { useRef, useEffect, useState } from 'react'
import p5 from '../utilities/p5'
import 'p5/lib/addons/p5.sound.js'
import styled from '@emotion/styled'
import song1 from '../utilities/song1.mp3'

const Container = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: 'black',
  width: '100%',
})

const sketch = (p) => {
  let song
  let amp
  let fft
  p.preload = () => {
    song = p.loadSound(song1)
  }

  p.setup = () => {
    p.frameRate(80)
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)
    p.angleMode(p.DEGREES)
    amp = new p5.Amplitude()
    fft = new p5.FFT()
  }

  p.draw = () => {
    p.background('black')
    p.noFill()
    p.stroke(255)
    let volume = amp.getLevel()

    let spectrum = fft.analyze()
    let wave = fft.waveform()

    p.push()
    for (let t = -1; t <= 1; t += 2) {
      p.beginShape()
      for (let i = 0; i <= 180; i++) {
        let index = Math.floor(p.map(i, 0, 180, 0, spectrum.length - 500))
        let r = p.map(spectrum[index], 0, 255, 350, 500)
        let x = r * p.sin(i) * t
        let y = r * p.cos(i)
        p.vertex(x, y)
      }
      p.endShape()
    }
    p.pop()

    p.push()
    for (let t = -1; t <= 1; t += 2) {
      p.beginShape()
      for (let i = 0; i <= 180; i += 0.5) {
        let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1))
        let r = p.map(wave[index], -1, 1, 275, 375)
        let x = r * p.sin(i) * t
        let y = r * p.cos(i)
        p.vertex(x, y)
      }
      p.endShape()
    }
    p.pop()

    p.mouseClicked = () => {
      if (song.isPlaying()) {
        song.pause()
        p.noLoop()
      } else {
        song.play()
        p.loop()
      }
    }

    p.push()
    let b1Speed = p.frameCount * 0.5
    let b1 = p.map(volume, 0, 0.5, 10, 50)
    p.rotateX(b1Speed)
    p.rotateY(b1Speed)
    p.rotateZ(b1Speed)
    p.box(b1)
    p.pop()

    let c1Speed = p.frameCount * 1
    p.push()
    let m1 = p.map(volume, 0, 0.5, 50, 200)
    p.rotateX(c1Speed * 1.1)
    p.rotateY(c1Speed)
    p.rotateZ(c1Speed)
    p.circle(0, 0, m1)
    p.pop()

    let c2Speed = p.frameCount * 1.2
    p.push()
    let m2 = p.map(volume, 0, 0.5, 100, 300)
    p.rotateX(c2Speed)
    p.rotateY(c2Speed * 1.2)
    p.rotateZ(c2Speed)
    p.circle(0, 0, m2)
    p.pop()

    let side = 50
    let triangleSpeed = p.frameCount * 0.6

    function tetrahedron() {
      p.beginShape(p.TRIANGLES)
      p.vertex(side, side, side)
      p.vertex(-side, -side, side)
      p.vertex(side, -side, -side)
      p.endShape()

      p.beginShape(p.TRIANGLES)

      p.vertex(-side, -side, side)
      p.vertex(side, -side, -side)
      p.vertex(-side, side, -side)
      p.endShape()

      p.beginShape(p.TRIANGLES)

      p.vertex(side, side, side)
      p.vertex(-side, side, -side)
      p.vertex(-side, -side, side)
      p.endShape()

      p.beginShape(p.TRIANGLES)

      p.vertex(side, side, side)
      p.vertex(side, -side, -side)
      p.vertex(-side, side, -side)
      p.endShape()
    }
    p.push()
    p.rotateX(triangleSpeed)
    p.rotateY(triangleSpeed)
    p.rotateZ(triangleSpeed)
    tetrahedron()
    p.pop()

    p.push()
    let circleSize = 275
    let gap = 10 + volume * 10
    for (let i = 1; i < 20; i++) {
      p.rotate(p.frameCount * 0.03 * volume)
      p.arc(0, 0, circleSize + gap * i, circleSize + gap * i, 45 * i, 45 * i + 50)
    }
    p.pop()
  }
}

const Sketch = () => {
  const canvasParentEl = useRef()
  const p5Instance = useRef()

  useEffect(() => {
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
