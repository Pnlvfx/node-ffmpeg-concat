import coraline from 'coraline';
import concat from './ffmpeg-concat.js';

const run = async () => {
  await coraline.input.create();
  await concat({
    videos: ['media/0.mp4', 'media/0a.mp4', 'media/1.mp4', 'media/2.mp4'],
    transition: { name: 'directionalwipe', duration: 500 },
    output: './media/example.mp4',
  });
};

void run();
