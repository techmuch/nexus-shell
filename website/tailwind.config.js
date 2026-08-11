import shared from '../tailwind.config.js';

/**
 * The site reuses the library's design tokens verbatim, so documentation
 * chrome and the components it documents can never drift apart visually.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  ...shared,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './website/index.html',
    './website/src/**/*.{js,ts,jsx,tsx}',
    '../src/**/*.{js,ts,jsx,tsx}',
    '../website/src/**/*.{js,ts,jsx,tsx}',
  ],
};
