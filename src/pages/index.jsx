import dynamic from 'next/dynamic'

const Sketch = dynamic(() => import('../web/components/Sketch'), { ssr: false })

export default function Home() {
  return <Sketch />
}
