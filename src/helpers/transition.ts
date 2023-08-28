import createTransition from "gl-transition";
import createBuffer from 'gl-buffer';
import createTexture from 'gl-texture2d'
import transitions from 'gl-transitions'
import { getPixelsFn } from './get-pixels.js'

export const createTransitionfn = (opts) => {
    const {
        name = 'directionalwarp',
        resizeMode = 'stretch',
        gl
    } = opts

    const buffer = createBuffer(gl,
        [-1, -1, -1, 4, 4, -1],
        gl.ARRAY_BUFFER,
        gl.STATIC_DRAW
    )

    const transitionName = name.toLowerCase()
    const source = transitions.find(t => t.name.toLowerCase() === transitionName) ||
        transitions.find(t => t.name.toLowerCase() === 'fade')

    const transition = createTransition.default(gl, source, {
        resizeMode
    })

    return {
        name,
        draw: async ({
            imagePathFrom,
            imagePathTo,
            progress,
            params
        }) => {
            gl.clear(gl.COLOR_BUFFER_BIT)

            const dataFrom = await getPixelsFn(imagePathFrom, {
                width: gl.drawingBufferWidth,
                height: gl.drawingBufferHeight
            })

            const textureFrom = createTexture(gl, dataFrom)
            textureFrom.minFilter = gl.LINEAR
            textureFrom.magFilter = gl.LINEAR

            const dataTo = await getPixelsFn(imagePathTo, {
                width: gl.drawingBufferWidth,
                height: gl.drawingBufferHeight
            })
            const textureTo = createTexture(gl, dataTo)
            textureTo.minFilter = gl.LINEAR
            textureTo.magFilter = gl.LINEAR

            buffer.bind()
            transition.draw(progress, textureFrom, textureTo, gl.drawingBufferWidth, gl.drawingBufferHeight, params)

            textureFrom.dispose()
            textureTo.dispose()
        },

        dispose: () => {
            buffer.dispose()
            transition.dispose()
        }
    }
}