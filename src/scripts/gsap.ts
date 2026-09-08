/** One place to register GSAP and its plugins. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };

export const EASE = 'power2.out';
export const motionOn = () => document.documentElement.classList.contains('motion');
export const finePointer = () => document.documentElement.classList.contains('fine');
export const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;
