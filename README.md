# node-ffmpeg-concat

> Concats a list of videos together using ffmpeg with sexy OpenGL transitions.

![NPM](https://img.shields.io/npm/v/node-ffmpeg-concat.svg)

![](https://raw.githubusercontent.com/transitive-bullshit/ffmpeg-concat/master/media/example.gif)

_(example of 9 videos concatenated together with unique transitions)_

_(note that the quality and fps is only poor due to the GIF preview; [here](https://raw.githubusercontent.com/transitive-bullshit/ffmpeg-concat/master/media/example.mp4) is the original)_

## Note

This is a reimagined version of the original `ffmpeg-concat` package, designed to provide enhanced features, TypeScript support, and a comprehensive collection of transition names. The goal is to offer improved functionality and maintain regular updates. If you encounter any issues or have feedback, please feel free to leave them on the [GitHub repository](https://github.com/Pnlvfx/node-ffmpeg-concat).

Noteworthy Features:

- Extended feature set for more versatile video concatenation and manipulation.
- Full compatibility with both CommonJS (cjs) and ECMAScript Modules (esm), catering to various project setups and preferences.

Compatibility Note:

- The package includes the 'gl' dependency, which is crucial for its functionality.
- Currently, due to limitations in the 'gl' package support, there are compatibility issues with Node.js version 20.
- Therefore, Node.js version 19 is the highest version guaranteed to work seamlessly with this package.

## Intro

[FFmpeg](http://ffmpeg.org/) is the de facto standard in command-line video editing, but it is really difficult to concatenate videos together using non-trivial transitions. Here are some [convoluted](https://superuser.com/questions/778762/crossfade-between-2-videos-using-ffmpeg) [examples](https://video.stackexchange.com/questions/17502/concate-two-video-file-with-fade-effect-with-ffmpeg-in-linux) of a simple cross-fade between two videos. FFmpeg filter graphs are extremely powerful, but for implementing transitions, they are just too complicated and error-prone.

[GL Transitions](https://gl-transitions.com/), on the other hand, is a great open source initiative spearheaded by [Gaëtan Renaudeau](https://github.com/gre) that is aimed at using GLSL to establish a universal [collection](https://gl-transitions.com/gallery) of transitions. Its extremely simple spec makes it really easy to customize existing transitions or write your own as opposed to struggling with complex ffmpeg filter graphs.

**This module and CLI make it easy to concat videos together using gl-transitions.**

## Install

This module requires [ffmpeg](http://ffmpeg.org/) to be installed.

We also decide to make sharp as a peer dependency as a lot of projects are using it so make sure to install it before proceeding:

```bash
npm install --save sharp
```

```bash
npm install --save node-ffmpeg-concat

# or if you want to use the CLI
npm install -g -node-ffmpeg-concat
```

WARNING: The CLI is not supported in this version yet, it will be implemented soon.

This package runs on Linux, macOS, and Windows.

Node.js versions 10.13.0 and up to node 20.3, for now, are supported. Note (**macOS only**): due to an inadvertant low-level breaking change in libuv's process handling code, OpenGL [is not supported](https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions) when running Node.js version 12.13.1 through to 13.6.0 on macOS. A fix has been released in Node.js version 13.7.0. A fix for 12.x is pending. Other platforms are unaffected.

## CLI

```sh
  Usage: node-ffmpeg-concat [options] <videos...>

  Options:

    -V, --version                         output the version number
    -o, --output <output>                 path to mp4 file to write (default: out.mp4)
    -t, --transition-name <name>          name of gl-transition to use (default: fade)
    -d, --transition-duration <duration>  duration of transition to use in ms (default: 500)
    -T, --transitions <file>              json file to load transitions from
    -f, --frame-format <format>           format to use for temp frame images (default: raw)
    -c, --concurrency <number>            number of videos to process in parallel (default: 4)
    -C, --no-cleanup-frames               disables cleaning up temp frame images
    -O, --temp-dir <dir>                  temporary working directory to store frame data
    -v, --verbose                         enable verbose logging from FFmpeg
    -h, --help                            output usage information

  Example:

    node-ffmpeg-concat -t circleopen -d 750 -o huzzah.mp4 0.mp4 1.mp4 2.mp4
```

## Usage

```js
import { concat } from 'node-ffmpeg-concat';

// concat 3 mp4s together using 2 500ms directionalWipe transitions
await concat({
  output: 'test.mp4',
  videos: ['media/0.mp4', 'media/1.mp4', 'media/2.mp4'],
  transition: {
    name: 'directionalWipe',
    duration: 500,
  },
});
```

```js
// concat 5 mp4s together using 4 different transitions
await concat({
  output: 'test.mp4',
  videos: ['media/0.mp4', 'media/1.mp4', 'media/2.mp4', 'media/0.mp4', 'media/1.mp4'],
  transitions: [
    {
      name: 'circleOpen',
      duration: 1000,
    },
    {
      name: 'crossWarp',
      duration: 800,
    },
    {
      name: 'directionalWarp',
      duration: 500,
      // pass custom params to a transition
      params: { direction: [1, -1] },
    },
    {
      name: 'squaresWire',
      duration: 2000,
    },
  ],
});
```

```js
import { transitions } from 'node-ffmpeg-concat';
// get a list of all transitions
// all transitions have a strong typescript support, and you can get suggestions for all available transitions name.
```

## API

### concat(options)

Concatenates video files together along with OpenGL transitions. Returns a `Promise` for when the output video has been written.

Note that you must specify `videos`, `output`, and either `transition` or `transitions`.

Note that the output video's size and fps are determined by the first input video.

#### options

##### videos

Type: `Array<String>`
**Required**

Array of videos to concat, where each item is a path or URL to a video file.

##### output

Type: `String`
**Required**

Path to an `mp4` video file to write.

Note: we currently only support outputting to mp4; please open an issue if you'd like to see support for more formats.

##### transition

Type: `Object`

Specifies a default transition to be used between each video.

Note that you must specify either `transition` or `transitions`, depending on how much control you want over each transition. If you specify both, `transitions` takes precedence.

```js
// example
const transition = {
  duration: 1000, // ms
  name: 'directionalwipe', // gl-transition name to use (will match with lower-casing)
  params: { direction: [1, -1] }, // optionally override default parameters
};
```

##### transitions

Type: `Array<Object>`

Specifies a (possibly unique) transition between each video. If there are N videos, then there should be N - 1 transitions.

Note that you must specify either `transition` or `transitions`, depending on how much control you want over each transition. If you specify both, `transitions` takes precedence.

```js
// example
const transitions = [
  {
    duration: 1000,
    name: 'fade',
  },
  {
    duration: 500,
    name: 'swap',
  },
];
```

##### audio

Type: `String`
**Optional**

Path or URL to an audio file to use as the audio track for the output video.

if parameter is not provided - assuming user wants to concat the source scenes audio.

##### args

Type: `Array<String>`
**Optional**

Default: `['-c:v', 'libx264', '-profile:v', 'main', '-preset', 'medium', '-crf 20', '-movflags', 'faststart']`

Array of output-only ffmpeg command line arguments for the final video.

##### frameFormat

Type: `string`
Default: `raw`

The format for temporary frame images. You may, for example, use `png` or `jpg`.

Note: the default is `raw` for performance reasons, as writing and reading raw binary pixel data is much faster than encoding and decoding `png` frames. Raw format is difficult to preview and debug, however, in which case you may want to change `frameFormat` to `png`.

##### concurrency

Type: `Number`
Default: `4`

Max number of videos to process in parallel.

##### log

Type: `Function`
Default: `noop`

Optional function to log progress and the underlying ffmpeg commands. You may, for example, use `console.log`

##### cleanupFrames

Type: `boolean`
Default: `true`

By default, we cleanup temporary frame images. Set this to `false` if you need to debug intermediate results.

##### tempDir

Type: `string`
Default: random directory in `/tmp`

The temporary working directory to store intermediate frame data. This is where the frames in `cleanupFrames` will be saved.

## Transitions

Here are some [gl-transitions](https://gl-transitions.com/) that I've found particularly useful for quality video transitions:

- [fade](https://gl-transitions.com/editor/fade)
- [fadegrayscale](https://gl-transitions.com/editor/fadegrayscale)
- [circleopen](https://gl-transitions.com/editor/circleopen)
- [directionalwarp](https://gl-transitions.com/editor/directionalwarp)
- [directionalwipe](https://gl-transitions.com/editor/directionalwipe)
- [crosswarp](https://gl-transitions.com/editor/crosswarp)
- [crosszoom](https://gl-transitions.com/editor/CrossZoom)
- [dreamy](https://gl-transitions.com/editor/Dreamy)
- [squareswire](https://gl-transitions.com/editor/squareswire)
- [angular](https://gl-transitions.com/editor/angular)
- [radial](https://gl-transitions.com/editor/Radial)
- [cube](https://gl-transitions.com/editor/cube)
- [swap](https://gl-transitions.com/editor/swap)

## Related

- [ffmpeg-gl-transition](https://github.com/transitive-bullshit/ffmpeg-gl-transition) - Low-level ffmpeg filter for applying GLSL transitions between video streams ([gl-transitions](https://gl-transitions.com/)). It allows the use of more advanced and customizable filter graphs, but it requires you to build a custom version of ffmpeg.
- [gl-transitions](https://gl-transitions.com/) - Collection of GLSL transitions.
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) - Underlying ffmpeg wrapper library.
- [awesome-ffmpeg](https://github.com/transitive-bullshit/awesome-ffmpeg) - A curated list of awesome ffmpeg resources with a focus on JavaScript.

## License

MIT © [Simone Gauli](https://github.com/Pnlvfx)
