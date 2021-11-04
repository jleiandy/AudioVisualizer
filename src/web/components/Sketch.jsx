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

const sketch = ({ soundFile, p }) => {
  let song
  let amp
  let fft
  let frequencyGate
  let bandWidth
  let reverbMix
  let reverbAmp
  let songScrubber
  let filter
  let reverb
  let volumeSlider
  let playButton
  let debounceTimeout
  p.preload = () => {
    song = p.loadSound(soundFile ?? song1)
  }
  p.windowResized = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout)

    debounceTimeout = setTimeout(() => {
      p.resizeCanvas(p.windowWidth, p.windowHeight)
      playButton.position((p.windowWidth * 3) / 4 + 25, p.windowHeight / 2)
      // hideButton.position(p.windowWidth * 0.95, p.windowHeight * 0.95)
      frequencyGate.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55)
      bandWidth.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55 + 20)
      reverbMix.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55 + 40)
      reverbAmp.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55 + 60)
      songScrubber.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55 + 80)
      volumeSlider.position((p.windowWidth * 3) / 4 - 20, p.windowHeight * 0.55 + 100)
    }, 150)
  }

  p.setup = () => {
    p.frameRate(80)
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL)

    p.angleMode(p.DEGREES)
    amp = new p5.Amplitude()
    fft = new p5.FFT()
    filter = new p5.BandPass()
    reverb = new p5.Reverb()
    song.disconnect()
    filter.process(song)
    reverb.process(song, 3, 2)
    playButton = p.createButton('Play')
    playButton.mousePressed(togglePlay)
    playButton.position((p.width * 3) / 4 + 25, p.height / 2)
    playButton.style('background', 'transparent')
    playButton.style('color', '#fff')
    playButton.style('border', 'solid 2px #fff')

    frequencyGate = p.createSlider(0, 100, 0)
    frequencyGate.position((p.width * 3) / 4 - 20, p.height * 0.55)
    frequencyGate.style('background', '#222')

    bandWidth = p.createSlider(0, 100, 0)
    bandWidth.position((p.width * 3) / 4 - 20, p.height * 0.55 + 20)

    reverbMix = p.createSlider(0, 100, 0)
    reverbMix.position((p.width * 3) / 4 - 20, p.height * 0.55 + 40)

    reverbAmp = p.createSlider(0, 100, 0)
    reverbAmp.position((p.width * 3) / 4 - 20, p.height * 0.55 + 60)

    songScrubber = p.createSlider(0, song.duration(), song.currentTime())
    songScrubber.position((p.width * 3) / 4 - 20, p.height * 0.55 + 80)
    songScrubber.changed(scrubSong)

    volumeSlider = p.createSlider(0, 100, 100)
    volumeSlider.position((p.width * 3) / 4 - 20, p.height * 0.55 + 100)
    volumeSlider.style('transform: rotate(90) deg')
    volumeSlider.changed(changeVolume)
  }

  function togglePlay() {
    if (song.isPlaying()) {
      song.pause()
      playButton.html('Play')
      playButton.position((p.width * 3) / 4 + 25, p.height / 2)
    } else {
      song.play()
      playButton.html('Pause')
      playButton.position((p.width * 3) / 4 + 20, p.height / 2)
    }
  }
  let hidden = false
  p.keyPressed = () => {
    if (p.keyCode === 80) {
      togglePlay()
    }
    if (p.keyCode === 72 || p.keyCode === 32) {
      if (!hidden) {
        playButton.hide()
        frequencyGate.hide()
        bandWidth.hide()
        reverbMix.hide()
        reverbAmp.hide()
        songScrubber.hide()
        volumeSlider.hide()
        hidden = !hidden
      } else {
        playButton.show()
        frequencyGate.show()
        bandWidth.show()
        reverbMix.show()
        reverbAmp.show()
        songScrubber.show()
        volumeSlider.show()
        hidden = !hidden
      }
    }
  }

  function scrubSong() {
    song.play()
    song.jump(songScrubber.value())

    playButton.html('Pause')
  }

  function changeVolume() {
    song.setVolume(p.map(volumeSlider.value(), 0, 100, 0, 1))
  }
  function tetrahedron(side) {
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

  p.draw = () => {
    if (!song.isPlaying()) {
      playButton.html('Play')
    }
    p.background('black')
    p.noFill()
    p.stroke(255)
    let volume = amp.getLevel()
    let spectrum = fft.analyze()
    let wave = fft.waveform()

    let filterFreq = p.map(frequencyGate.value(), 0, 100, 10, 22050)
    let filterWidth = p.map(bandWidth.value(), 0, 100, 0, 10)
    filter.freq(filterFreq)
    filter.res(filterWidth)

    reverb.drywet(p.map(reverbMix.value(), 0, 100, 0, 1))
    reverb.amp(p.map(reverbAmp.value(), 0, 100, 0, 1))
    p.push()
    if (volume >= 0.3) {
      p.stroke(p.random(255), p.random(255), p.random(255))
    }
    for (let t = -1; t <= 1; t += 2) {
      p.beginShape()
      for (let i = 0; i <= 180; i++) {
        let index = Math.floor(p.map(i, 0, 180, 0, spectrum.length - 500))
        let r = p.map(spectrum[index], 0, 255, 350, 475)
        let x = r * p.sin(i) * t
        let y = r * p.cos(i)
        p.vertex(x, y)
      }
      p.endShape()
    }
    p.pop()

    p.push()
    if (volume >= 0.3) {
      p.stroke(p.random(255), p.random(255), p.random(255))
    }

    for (let t = -1; t <= 1; t += 2) {
      p.beginShape()
      for (let i = 0; i <= 180; i += 0.1) {
        let index = p.floor(p.map(i, 0, 180, 0, wave.length - 1))
        let r = p.map(wave[index], -1, 1, 275, 375)
        let x = r * p.sin(i) * t
        let y = r * p.cos(i)
        p.vertex(x, y)
      }
      p.endShape()
    }
    p.pop()

    p.push()
    if (volume >= 0.3) {
      p.stroke('white')
      p.fill(p.random(255), p.random(255), p.random(255))
    }
    let b1Speed = p.frameCount * 0.5
    let b1 = p.map(volume, 0, 0.5, 20, 60)
    p.rotateX(b1Speed)
    p.rotateY(b1Speed)
    p.rotateZ(b1Speed)
    p.box(b1)
    p.pop()

    let c1Speed = p.frameCount
    p.push()
    let m1 = p.map(volume, 0, 0.5, 75, 200)
    p.rotateX(c1Speed * 1.1)
    p.rotateY(c1Speed)
    p.rotateZ(c1Speed)
    p.circle(0, 0, m1)
    p.pop()

    p.push()
    p.rotateX(c1Speed)
    p.rotateY(c1Speed * 1.2)
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

    let triangleSpeed = p.frameCount * 0.1

    p.push()
    p.rotateX(triangleSpeed)
    p.rotateY(triangleSpeed)
    p.rotateZ(triangleSpeed)
    tetrahedron(50)
    p.pop()

    p.push()
    if (volume >= 0.3) {
      p.normalMaterial()
    }
    p.stroke(255)
    let orbitCenterX = 0
    let orbitCenterY = 0
    let orbitRadius = 50
    let speed = 0.5
    let x = orbitCenterX + orbitRadius * p.cos(p.frameCount * speed)
    let y = orbitCenterY + orbitRadius * p.sin(p.frameCount * speed)
    p.push()
    p.translate(100 * p.cos(0) + x, 100 * p.sin(0) + y)
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.rotateZ(triangleSpeed)
    tetrahedron(10)

    p.pop()
    p.push()
    p.translate(100 * p.cos(120) - x, 100 * p.sin(120) + y)
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.rotateZ(triangleSpeed)
    tetrahedron(10)
    p.pop()

    p.push()
    p.translate(100 * p.cos(240) - x, 100 * p.sin(240) - y)
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.rotateZ(triangleSpeed)
    tetrahedron(10)
    p.pop()

    p.pop()

    p.push()
    let circleSize = 275
    let gap = 10 + volume * 10
    for (let i = 1; i < 20; i++) {
      p.rotate(p.frameCount * 0.03 * volume)
      p.arc(0, 0, circleSize + gap * i, circleSize + gap * i, 45 * i, 45 * i + 50)
    }
    p.pop()

    p.push()
    let circleRadius = 195

    p.push()
    p.stroke(255)
    let growth1 = 0
    if (spectrum[10] >= 180) {
      growth1 = 5
      p.fill(127, 0, 255)
    }
    p.translate(circleRadius * p.cos(0), circleRadius * p.sin(0))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth1)
    p.pop()

    p.push()
    let growth2 = 0
    if (spectrum[20] >= 200) {
      growth2 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(30), circleRadius * p.sin(30))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth2)
    p.pop()

    p.push()
    let growth3 = 0
    if (spectrum[30] >= 140) {
      growth3 = 5
      p.fill(0, 0, 255)
    }
    p.translate(circleRadius * p.cos(60), circleRadius * p.sin(60))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth3)
    p.pop()

    p.push()
    let growth4 = 0
    if (spectrum[40] >= 150) {
      growth4 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(90), circleRadius * p.sin(90))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth4)
    p.pop()

    p.push()
    let growth5 = 0
    if (spectrum[50] >= 150) {
      growth5 = 5
      p.fill(255, 155, 0)
    }
    p.translate(circleRadius * p.cos(120), circleRadius * p.sin(120))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth5)
    p.pop()

    p.push()
    let growth6 = 0
    if (spectrum[60] >= 180) {
      growth6 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(150), circleRadius * p.sin(150))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth6)
    p.pop()

    p.push()
    let growth7 = 0
    if (spectrum[100] >= 150) {
      growth7 = 5
      p.fill(50, 205, 50)
    }
    p.translate(circleRadius * p.cos(180), circleRadius * p.sin(180))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth7)
    p.pop()

    p.push()
    let growth8 = 0
    if (spectrum[120] >= 150) {
      growth8 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(210), circleRadius * p.sin(210))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth8)
    p.pop()

    p.push()
    let growth9 = 0
    if (spectrum[140] >= 155) {
      growth9 = 5
      p.fill(255, 165, 0)
    }
    p.translate(circleRadius * p.cos(240), circleRadius * p.sin(240))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth9)
    p.pop()

    p.push()
    let growth10 = 0
    if (spectrum[160] >= 150) {
      growth10 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(270), circleRadius * p.sin(270))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth10)
    p.pop()

    p.push()
    let growth11 = 0
    if (spectrum[180] >= 150) {
      growth11 = 5
      p.fill(255, 0, 0)
    }
    p.translate(circleRadius * p.cos(300), circleRadius * p.sin(300))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth11)
    p.pop()

    p.push()
    let growth12 = 0
    if (spectrum[200] >= 150) {
      growth11 = 5
      p.normalMaterial()
    }
    p.translate(circleRadius * p.cos(330), circleRadius * p.sin(330))
    p.rotateX(p.frameCount)
    p.rotateY(y)
    p.box(20 + growth12)
    p.pop()
  }
}

const Sketch = () => {
  const canvasParentEl = useRef()
  const p5Instance = useRef()
  const [soundFile, setSoundFile] = useState()

  useEffect(() => {
    if (p5Instance.current) {
      p5Instance.current.remove()
    }

    p5Instance.current = new p5((p) => sketch({ soundFile, p }), canvasParentEl.current)
    return () => {
      p5Instance.current.remove()
    }
  }, [soundFile])

  function handleSongUpload(e) {
    e.preventDefault()
    setSoundFile(e.dataTransfer.files[0])
  }

  return (
    <Container
      type="file"
      onDrop={handleSongUpload}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      ref={canvasParentEl}
    />
  )
}

export default Sketch
