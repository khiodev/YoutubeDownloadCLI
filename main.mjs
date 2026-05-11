#!/usr/bin/env node
import fs from 'fs';
import prompts from 'prompts';
import figlet from 'figlet';
import chalk from 'chalk';
import os, { type } from 'os';
import path from 'path';
import { YtDlp } from 'ytdlp-nodejs';
import childProcess from 'child_process';

const ytdlp = new YtDlp();

try {
  childProcess.execSync('ffmpeg -version');
} catch (e) {
  console.log(chalk.red("FFmpeg not found."));
  console.log(chalk.red("Installing FFmpeg (This might take a few seconds)..."));
  await ytdlp.downloadFFmpeg();
}

const text = figlet.textSync('YOUTUBE DL', { font: 'Standard' });
console.log(chalk.red(text));
function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

console.log(chalk.redBright('Enter details about the video:'));
console.log(chalk.gray('You can always exit by pressing Ctrl + C, However if you exit during download youtubeDL might leave a currpted video file.'));

const urlPrompt = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the YouTube video URL:',
    validate: value => !value || !youtube_parser(value) ? 'Enter a valid YouTube URL' : true,
});

console.log(chalk.redBright('Fetching video...'));

const vidID = youtube_parser(urlPrompt.url);
const info = await ytdlp.getInfoAsync(urlPrompt.url);
const vidTitle = info.title

console.log(chalk.redBright(`Fetched video: "${vidTitle}"`));

const typePrompt = await prompts({
    type: 'text',
    name: 'type',
    message: 'What format do you want?:',
    initial: 'mp4',
    validate: value => value === 'mp4' || value === 'mp3' ? true : 'Please enter "mp4" or "mp3"',
});

const dirPrompt = await prompts({
    type: 'text',
    name: 'dir',
    message: 'Where do you want to save the video?:',
    initial: 'Desktop',
});

const fileNamePrompt = await prompts({
    type: 'text',
    name: 'fileName',
    message: 'Enter the file name:',
    initial: vidTitle,
});

console.log(chalk.greenBright(`Downloading video "${vidTitle}" in ${typePrompt.type} format to ${dirPrompt.dir}...`));

var directory;

if (dirPrompt.dir === 'Desktop') {
  directory = path.join(os.homedir(), "Desktop");
}

var outputPath = path.join(directory, fileNamePrompt.fileName);

var filter;

if (typePrompt.type === 'mp4') {
  filter = "mergevideo"
} else if (typePrompt.type === 'mp3') {
  filter = "audioonly"
}

const result = await ytdlp
  .download(urlPrompt.url)
  .filter(filter)
  .quality('highest')
  .type(typePrompt.type)
  .setOutputTemplate(outputPath)
  .on('progress', (p) => {
    var msg = `Downloading ${p.percentage_str}`;

    if (p.percentage_str === "100%") {msg = `Downloading ${p.percentage_str}... Processing...`}

    process.stdout.write(`\r${chalk.greenBright(msg)}`)
  })
  .run();

console.log('\u0007');
console.log(chalk.greenBright(`Download done!, Video saved to ${dirPrompt.dir}`));