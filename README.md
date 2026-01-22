# Webcam Storyteller

A short description of the project — what it does and why it exists.
(Replace this with a one-line summary.)

## Installation

### Prerequisites
- Node.js 18.x (LTS) or later recommended.
- Yarn (preferred): https://yarnpkg.com/
- A modern browser with webcam support (Chrome, Edge, Firefox).

### Clone
```bash
git clone https://github.com/Nate-Mina/webcam-storyteller.git
cd webcam-storyteller
```

### Install dependencies (Yarn)
```bash
yarn install
```

### Run in development
```bash
yarn dev
```
- This starts the development server and enables hot-reloading.
- The exact dev script name may vary; `yarn dev` is the common convention.

### Build for production
```bash
yarn build
```

### Preview production build / Start
```bash
yarn preview
# or if a start script is provided:
yarn start
```

## Environment variables
If the project uses environment variables, create a `.env` file from the example and fill in the values:

```bash
cp .env.example .env
```

Example `.env.example` (update with real variables if needed):
```env
# API endpoint used by the app
REACT_APP_API_URL=http://localhost:3000

# Add additional variables the app requires below
```

## Webcam / Browser notes
- Localhost: Browsers generally allow camera access from `http://localhost` (no HTTPS required). For remote hosts or IPs, a secure context (HTTPS) is required to access the camera.
- Permissions: When the browser prompts, allow camera access. If denied, check the site permissions and OS privacy settings.
- If testing over HTTPS locally is required, tools like `mkcert` or a local dev server with TLS can help.

## Troubleshooting
- "No camera found": Ensure the camera is connected and not in use by another app; check OS privacy settings to make sure the browser has camera access.
- "Permission denied": Re-check browser site permissions and OS privacy settings.
- If the app fails to start, run `yarn install` again and verify Node.js version compatibility.

## Contributing
- If you'd like improvements to these instructions (Node version pinning, CI steps, or Docker usage), open a PR or provide notes and I can update this file.

## License
- Add your license information here.
