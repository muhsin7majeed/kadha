import { mkdir, readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const projectDir = resolve(import.meta.dirname, '../..');
const outputDir = resolve(projectDir, 'demo/output');
const scenesDir = resolve(outputDir, 'scenes');
const timelinePath = resolve(outputDir, 'timeline.json');
const rawVideoPath = resolve(outputDir, 'kadha-raw.webm');
const silentVideoPath = resolve(outputDir, 'kadha-showcase-silent.mp4');
const finalVideoPath = resolve(outputDir, 'kadha-product-showcase.mp4');
const logoPath = resolve(projectDir, 'client/public/pwa-512x512.png');
const fontPath = '/usr/share/fonts/liberation/LiberationSans-Regular.ttf';
const boldFontPath = '/usr/share/fonts/liberation/LiberationSans-Bold.ttf';
const transitionDuration = 0.7;
const sceneEdits = {
  track: { offset: 26, duration: 14 },
  progress: { offset: 2, duration: 10 },
  collections: { offset: 3, duration: 10 },
};

const run = (command, args) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', rejectRun);
    child.on('exit', (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} exited with code ${code}`));
    });
  });

const escapeDrawText = (value) => value.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");

await mkdir(scenesDir, { recursive: true });

const timeline = JSON.parse(await readFile(timelinePath, 'utf8'));
const renderedScenes = [];

const renderCard = async ({ output, duration, title, subtitle, outro = false }) => {
  const titleText = escapeDrawText(title);
  const subtitleText = escapeDrawText(subtitle);
  const logoSize = outro ? 148 : 176;
  const logoY = outro ? 228 : 205;
  const titleY = outro ? 430 : 448;

  const filter = [
    `[0:v]scale=${logoSize}:${logoSize},format=rgba,fade=t=in:st=0:d=0.9:alpha=1[logo]`,
    `[1:v]drawbox=x=0:y=0:w=iw:h=ih:color=#050507:t=fill[base]`,
    `[base][logo]overlay=x=(W-w)/2:y=${logoY}:format=auto[withlogo]`,
    `[withlogo]drawtext=fontfile='${boldFontPath}':text='${titleText}':fontcolor=white:fontsize=${outro ? 72 : 66}:x=(w-text_w)/2:y=${titleY}+18*(1-min(t/.9\\,1)):alpha='min(t/.9\\,1)'[title]`,
    `[title]drawtext=fontfile='${fontPath}':text='${subtitleText}':fontcolor=#a9a9b2:fontsize=30:x=(w-text_w)/2:y=${titleY + 104}:alpha='min(max((t-.35)/.9\\,0)\\,1)'[text]`,
    outro
      ? `[text]drawtext=fontfile='${fontPath}':text='kadha.org':fontcolor=#ff8a3d:fontsize=25:x=(w-text_w)/2:y=674:alpha='min(max((t-.8)/.8\\,0)\\,1)',drawtext=fontfile='${fontPath}':text='This product uses the TMDB API but is not endorsed or certified by TMDB.':fontcolor=#777780:fontsize=17:x=(w-text_w)/2:y=1014`
      : `[text]null`,
  ].join(';');

  await run('ffmpeg', [
    '-y',
    '-loop',
    '1',
    '-i',
    logoPath,
    '-f',
    'lavfi',
    '-i',
    `color=c=#050507:s=1920x1080:r=30:d=${duration}`,
    '-filter_complex',
    filter,
    '-t',
    String(duration),
    '-r',
    '30',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '16',
    '-pix_fmt',
    'yuv420p',
    output,
  ]);
};

const introPath = resolve(scenesDir, '00-intro.mp4');
await renderCard({
  output: introPath,
  duration: 5.4,
  title: 'Your stories. Beautifully organized.',
  subtitle: 'Movies, shows, and every moment between.',
});
renderedScenes.push({ path: introPath, duration: 5.4 });

for (const [index, scene] of timeline.scenes.entries()) {
  const edit = sceneEdits[scene.id] ?? { offset: 0, duration: scene.end - scene.start };
  const sceneStart = Math.min(scene.start + edit.offset, scene.end - 1);
  const duration = Math.max(1, Math.min(edit.duration, scene.end - sceneStart));
  const sceneEnd = sceneStart + duration;
  const output = resolve(scenesDir, `${String(index + 1).padStart(2, '0')}-${scene.id}.mp4`);
  const titleText = escapeDrawText(scene.title);
  const filter = [
    `[0:v]trim=start=${sceneStart}:end=${sceneEnd},setpts=PTS-STARTPTS,scale=1480:832:force_original_aspect_ratio=decrease[app]`,
    `[1:v]drawbox=x=198:y=166:w=1524:h=876:color=#000000@0.42:t=fill,drawbox=x=210:y=154:w=1500:h=856:color=#202026:t=fill[stage]`,
    `[stage][app]overlay=x=(W-w)/2:y=166:format=auto[screen]`,
    `[screen]drawtext=fontfile='${boldFontPath}':text='${titleText}':fontcolor=white:fontsize=49:x=(w-text_w)/2:y=55+18*(1-min(t/.75\\,1)):alpha='if(lt(t\\,.75)\\,t/.75\\,if(gt(t\\,${duration - 0.55})\\,(${duration}-t)/.55\\,1))'[caption]`,
    `[caption]zoompan=z='min(max(zoom\\,1.0)+0.00012\\,1.018)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30[out]`,
  ].join(';');

  await run('ffmpeg', [
    '-y',
    '-i',
    rawVideoPath,
    '-f',
    'lavfi',
    '-i',
    `color=c=#07070a:s=1920x1080:r=30:d=${duration}`,
    '-filter_complex',
    filter,
    '-map',
    '[out]',
    '-t',
    String(duration),
    '-r',
    '30',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '16',
    '-pix_fmt',
    'yuv420p',
    output,
  ]);

  renderedScenes.push({ path: output, duration });
}

const outroPath = resolve(scenesDir, '99-outro.mp4');
await renderCard({
  output: outroPath,
  duration: 6.2,
  title: 'Kadha',
  subtitle: 'Open source. Private by default. Self-hostable.',
  outro: true,
});
renderedScenes.push({ path: outroPath, duration: 6.2 });

const xfadeInputs = renderedScenes.flatMap((scene) => ['-i', scene.path]);
let offset = renderedScenes[0].duration - transitionDuration;
const xfadeFilters = [];

for (let index = 1; index < renderedScenes.length; index += 1) {
  const input = index === 1 ? '[0:v][1:v]' : `[v${index - 1}][${index}:v]`;
  const output = index === renderedScenes.length - 1 ? '[video]' : `[v${index}]`;
  xfadeFilters.push(`${input}xfade=transition=fade:duration=${transitionDuration}:offset=${offset}${output}`);
  offset += renderedScenes[index].duration - transitionDuration;
}

await run('ffmpeg', [
  '-y',
  ...xfadeInputs,
  '-filter_complex',
  xfadeFilters.join(';'),
  '-map',
  '[video]',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '16',
  '-pix_fmt',
  'yuv420p',
  silentVideoPath,
]);

const totalDuration = renderedScenes.reduce((total, scene) => total + scene.duration, 0) -
  transitionDuration * (renderedScenes.length - 1);

await run('ffmpeg', [
  '-y',
  '-i',
  silentVideoPath,
  '-f',
  'lavfi',
  '-i',
  `aevalsrc=0.018*(sin(2*PI*110*t)+0.62*sin(2*PI*164.81*t)+0.36*sin(2*PI*220*t)):s=48000:d=${totalDuration}`,
  '-filter_complex',
  `[1:a]lowpass=f=1200,tremolo=f=0.11:d=0.28,afade=t=in:st=0:d=3,afade=t=out:st=${Math.max(0, totalDuration - 4)}:d=4,volume=.32[audio]`,
  '-map',
  '0:v',
  '-map',
  '[audio]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-movflags',
  '+faststart',
  '-shortest',
  finalVideoPath,
]);

console.log(`Rendered ${basename(finalVideoPath)} (${totalDuration.toFixed(1)} seconds)`);
