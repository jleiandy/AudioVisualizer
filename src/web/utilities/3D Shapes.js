let side = 50
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
