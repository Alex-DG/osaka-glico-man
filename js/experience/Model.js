import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { gsap } from 'gsap'

import modelSrc from '../../assets/Running.fbx'
import LoadingManager from './LoadingManager'

class _Model {
  play({ detail }) {
    if (!this.isReady || this.isPlaying) return

    this.isPlaying = true

    console.log('▶️', 'Play')

    const { scalePower } = this.settings

    this.model.position.copy(detail.position)
    this.model.position.y /= 2
    this.model.quaternion.copy(detail.rotation)
    this.model.scale.set(
      detail.scale * scalePower,
      detail.scale * scalePower,
      detail.scale * scalePower
    )

    // const plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(2.5, 6, 32, 32),
    //   new THREE.MeshToonMaterial({ color: 'orange', wireframe: true })
    // )
    // plane.rotateX(-Math.PI / 2)
    // plane.position.copy(this.model.position)
    // plane.position.y /= -2
    // this.group.add(plane)

    gsap.to(this.materials, {
      opacity: 1,
      duration: 6,
      ease: 'power4.out',
      delay: 2,
      onStart: () => {
        this.action.running.play()
      },
    })
  }

  ////////////////////////////////////////////////////////////////////////////////

  async load() {
    try {
      const fbxLoader = new FBXLoader(LoadingManager)
      const model = await fbxLoader.loadAsync(modelSrc)

      model.traverse((child) => {
        if (child.isMesh) {
          if (child.name === 'Alpha_Surface') {
            child.material = new THREE.MeshToonMaterial({
              color: 'hotpink',
            })
          } else {
            child.material = new THREE.MeshToonMaterial({
              color: 'aqua',
            })
          }
          child.material.transparent = true
          child.material.opacity = 0

          const mat = child.material

          this.materials.push(mat)
        }
      })

      this.model = model
      this.group.add(model)

      /**
       * Animation
       */
      this.mixer = new THREE.AnimationMixer(model)
      this.action = {
        running: this.mixer.clipAction(model.animations[0]),
      }

      // Play animation
      //   this.play()

      console.log('success-load-model', { model })
    } catch (error) {
      console.error('error-load-model', { error })
      alert('error-load-model: please try again.')
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  bind() {}

  init() {
    this.bind()

    const { scene, camera } = XR8.Threejs.xrScene()
    this.scene = scene
    this.camera = camera

    this.group = new THREE.Group()
    this.scene.add(this.group)
    this.isReady = false
    this.isPlaying = false
    this.settings = { speed: 0.05, scalePower: 0.009 }
    this.materials = []

    const loading = document.getElementById('loading-layout')

    LoadingManager.onProgress = (_, loaded, total) => {
      const progress = (loaded / total) * 100
      console.log('⏳', `${progress?.toFixed(2)}%`)

      if (progress >= 100) {
        loading.remove()
        this.isReady = true
      }
    }

    this.load()
  }

  ////////////////////////////////////////////////////////////////////////////////

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime * this.settings.speed)
    }
  }
}

const Model = new _Model()
export default Model
