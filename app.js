import { get } from 'superagent';
import { load } from 'cheerio';
import { URL } from 'url';
import { createWriteStream } from 'fs';
import mkdirp from 'mkdirp';

const catalog = 'abstract';
const resolution = '1920x1200';
const path = 'wallpapers';
const pageAmount = 5;

function pagination(page) {
  if (page === 1) {
    return '';
  }

  return `/page${page}`;
}

function url(page) {
  return `https://wallpaperscraft.com/catalog/${ catalog }/downloads${ pagination(page) }`;
}

async function download(wallpaper) {
  const url = `https://wallpaperscraft.com/image/${ wallpaper }_${ resolution }.jpg`;
  const dir = `${ path }`;
  const filename = `${ dir }/${ wallpaper }.jpg`;

  console.log(`Downloading ${ wallpaper }...`);

  await mkdirp(dir);

  const file = createWriteStream(filename);
  const req = get(url);
  req.pipe(file);
}

async function getPage(page) {
  const res = await get(url(page));
  const $ = load(res.text);

  const list = $('.wallpaper_pre');

  list.each((i, elem) => {
    const href = $(elem).children('a').attr('href');
    const url = new URL('https:' + href);
    const wallpaper = url.pathname.split('/')[2];

    download(wallpaper);
  });
}

// Main
(async () => {
  for (let i = 1; i <= pageAmount; ++i) {
    await getPage(i);
  }

  console.log('\nProgram will exit when all download finished')
})();