# Colour Filter Camera

Colour Filter Camera lets you apply colour filters to your camera or screen feed in real time. Use it to select distinct colours by simulating colour vision deficiencies, enhance colour distinction via daltonization, simulate night light mode, or just have fun with visual effects.

Live Demo: https://kamide.github.io/colour-filter-camera/

## Setup

Run the following commands to clone, install, and start the dev server on http://localhost:5173

```bash
git clone https://github.com/Kamide/colour-filter-camera.git
cd colour-filter-camera
npm ci
npm run dev
```

WebGPU requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts). To test on your phone on the same network, use [Chrome's port forwarding settings](chrome://inspect/#devices) to forward the dev server port (5173).
