import Lights from '../experience/Lights'
import Model from '../experience/Model'

export const initWorldPipelineModule = () => {
  const clock = new THREE.Clock()

  const init = () => {
    Lights.init()
    Model.init()

    console.log('✨', 'World ready')
  }

  const update = () => {
    Model?.update(clock.getDelta())
  }

  // Places content over image target
  const showTarget = ({ detail }) => {
    console.log('🐵', 'SHOW TARGET')
    console.log({ detail })

    if (detail?.name === 'osaka-glico-man') {
      Model.play({ detail })
    }
  }

  const hideTarget = () => {
    console.log('🙈', 'HIDE TARGET')
  }

  return {
    name: 'init-world',

    onStart: () => init(),

    onUpdate: () => update(),

    // Listeners are called right after the processing stage that fired them. This guarantees that
    // updates can be applied at an appropriate synchronized point in the rendering cycle.
    listeners: [
      { event: 'reality.imagefound', process: showTarget },
      { event: 'reality.imageupdated', process: showTarget },
      { event: 'reality.imagelost', process: hideTarget },
    ],
  }
}
