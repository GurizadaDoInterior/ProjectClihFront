import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #F6F8FC;
}
@keyframes clih-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(6px,-4px); } }
@keyframes clih-trail { 0% { opacity: 0; transform: translate(8px,-5px) rotate(-35deg); } 20% { opacity: .35; } 100% { opacity: 0; transform: translate(-40px,25px) rotate(-35deg); } }
@keyframes clih-twinkle { 0%,100% { opacity: .2; } 50% { opacity: .85; } }
@keyframes clih-flame { 0%,100% { opacity: .85; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .clih-ambient { animation: none !important; }
}
`;
