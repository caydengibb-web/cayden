/** Home page. */
import { initSmooth, refreshSoon } from './smooth';
import { initHero, initTimecode } from './hero';
import { initReveal } from './reveal';
import { initWork } from './work';
import { initVimeo } from './vimeo';
import { initCursor } from './cursor';
import { initMagnetic, initPreview, initMarquee, initCount, initClock, initNavTheme } from './extras';

document.fonts.ready.then(() => {
  initSmooth();
  initHero();
  initTimecode();
  initWork();
  initReveal();
  initVimeo();
  initCursor();
  initMagnetic();
  initPreview();
  initMarquee();
  initCount();
  initClock();
  initNavTheme();
  refreshSoon();
});
