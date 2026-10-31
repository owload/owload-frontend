# owload-frontend

The web client of **Owload**: cloud file storage where files are **encrypted on your device before they are uploaded**. The server stores only
ciphertext and never receives your password or your keys, so a breach of the server or of the storage reveals only ciphertext.

This repository is where the encryption happens, so it is the one to read if you want to check the claim instead of taking our word for it.

## Three ways to use Owload

| | Where your encrypted files are | Who runs the service | Cost |
|---|---|---|---|
| **Web version** | Owload's storage, 3 GB | Owload | Free |
| **Web version with your own S3** | Your S3 bucket, as much as it holds | Owload | Free |
| **Self-hosted** | Your S3 bucket | You, from the Docker images | Free (your own server) |

Self-hosting needs this client (image `owload-frontend`), the API ([owload-backend](https://github.com/owload/owload-backend), image
`owload-backend`), a PostgreSQL database, a Keycloak server and an S3 bucket. The images are built by GitHub Actions and published on Docker Hub;
`owload-docs/operations/docker-images.md` and the Compose example next to it describe the installation.

## Features

- **Client-side encryption**: AES-256-CTR in the browser before any data leaves your machine; file contents, names and folder structure are all encrypted
- **Password-based keys**: symmetric keys are derived from the drive's password (PBKDF2-SHA-512, 100k iterations) and never sent to the server
- **Drives with roles**: private, shared (reader, writer, admin) and public (a read-only link, with the drive's password given separately)
- **Your storage or ours**: a drive lives on Owload's storage or on any S3-compatible bucket of yours, with up to two more copies
- **Previews in place**: documents, spreadsheets, presentations, photos (including HEIC) and videos; file formats are handled by [extensions](https://github.com/owload/editor-sdk)
- The code of the client is public: you can read what it does with your files

The Tauri desktop app (macOS, Windows, Linux) is in this code base but **has not been released**.

## Security model

Plaintext data and symmetric keys never leave the client. A compromised server can read only encrypted ciphertext.

- **Key derivation**: drive password → PBKDF2-SHA-512 (100k iterations) → `K_master`; HKDF-SHA-256 derives independent stream keys for ops log, file data, and caches
- **Encryption**: AES-256-CTR per stream; keystream uniqueness is guaranteed per stream by HKDF, not by counter alone
- **File integrity**: SHA-256 of plaintext computed on upload, verified on download; mismatch throws before the file is returned to the caller
- **Ops log integrity**: hash chain (`previousOperationHash`) embedded in each operation; tampering with any intermediate op breaks all subsequent chain entries

## Requirements

- Node.js ≥ 20 (the `@owload/xlsx-editor` dependency is built from GitHub during `npm install` and needs it)
- npm ≥ 9
- Rust ≥ 1.77.2 (for desktop build only)
- Keycloak server configured as the identity provider
- Owload backend API

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your server URLs:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_APP_KEYCLOAK_URL` | Keycloak base URL |
| `VITE_APP_KEYCLOAK_REALM` | Keycloak realm name |
| `VITE_APP_KEYCLOAK_CLIENT_ID` | Keycloak client ID |
| `VITE_APP_MAIN_BACKEND_URL` | Owload backend API base URL |

## Running

### Web (development)

```bash
npm run dev
```

Opens at `http://localhost:5173`. Authentication via Keycloak redirect flow.

### Desktop (development)

```bash
npm run tauri
```

Launches the Tauri desktop app with hot reload. Authentication via ROPC (username/password form).

### Web (production build)

```bash
npm run build
```

Output in `dist/`.

### Desktop (production build)

```bash
npm run tauri:build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

## Testing

```bash
# Unit tests
npm test

# Browser-based tests
npm run test:browser
```

## Tech stack

- **Frontend** — React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Router
- **Encryption** — Web Crypto API (AES-256-CTR, PBKDF2-SHA-512, HKDF-SHA-256)
- **Desktop** — Tauri 2
- **Auth** — Keycloak (OIDC)
