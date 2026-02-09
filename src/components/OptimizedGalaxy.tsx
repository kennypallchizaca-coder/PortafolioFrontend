// Fondo animado de galaxia optimizado con Memo

import { memo } from 'react'
import { GalaxyComponent } from '@r0rri/react-galaxy-bg'

const OptimizedGalaxy = memo(() => {
  return (
    <GalaxyComponent
      starCount1={400}
      starCount2={150}
      starCount3={60}
      enableShootingStars={false}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    />
  )
})

OptimizedGalaxy.displayName = 'OptimizedGalaxy'

export default OptimizedGalaxy
