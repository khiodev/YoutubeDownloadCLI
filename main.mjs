#!/usr/bin/env node
import fs from 'fs';
import { Innertube } from 'youtubei.js';
import youtubedl from 'youtube-dl-exec';
import prompts from 'prompts';
import figlet from 'figlet';
import chalk from 'chalk';
import os, { type } from 'os';
import path from 'path';
import { dir } from 'console';

const text = figlet.textSync('YOUTUBE DL', { font: 'Standard' });
console.log(chalk.red(text));

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

const urlPrompt = await prompts({
    type: 'text',
    name: 'url',
    message: 'Enter the YouTube video URL:',
    validate: value => !value || !youtube_parser(value) ? 'Enter a valid YouTube URL' : true,
});

console.log(chalk.redBright('Fetching video...'));

const vidID = youtube_parser(urlPrompt.url);
const youtube = await Innertube.create();
const info = await youtube.getBasicInfo(vidID, { client: 'IOS' });
const vidTitle = info.basic_info.title

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

var directory

if (dirPrompt.dir === 'Desktop') {
  directory = path.join(os.homedir(), "Desktop");
}

var outputPath = path.join(directory, fileNamePrompt.fileName);

if (typePrompt.type === 'mp4') {
    await youtubedl(urlPrompt.url, {
    output: outputPath,
    format: "bestvideo+bestaudio/best",
    mergeOutputFormat: "mp4",
    noWarnings: true,
    noCheckCertificates: true,
    });
}else if (typePrompt.type === 'mp3'){
    await youtubedl(urlPrompt.url, {
    output: outputPath,
    extractAudio: true,
    audioFormat: "mp3",
    noWarnings: true,
    noCheckCertificates: true,
    });
}

console.log('\u0007');
console.log(chalk.greenBright(`Download done!, Video saved to ${dirPrompt.dir}`));