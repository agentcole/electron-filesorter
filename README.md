# AI Search for your files

Like google on steroids for your own files.
You'll never have to look for anything.

Supported file formats:

- Text, Office, CSV, xlsx, PDF..
- Images (OCR + image description)
- Audio (complete transcription)
- Video (coming soon)

DB:

- Vectra
- Embeddings: https://ollama.com/library/mxbai-embed-large

# Installation

## Install ollama

To easily use all the OS models available we take advantage of https://ollama.com/.
Go there download and install the package.

In your termianl pull the models

```bash
 # llm
ollama pull llama3
 # embedding
ollama pull mxbai-embed-large
 # vision
ollama pull llava
 # translation
ollama pull winkefinger/alma-13b
```

## Install whisper

```bash
cd ./node_modules/whisper-node/lib/whisper.cpp
make
npx whisper-node download # choose a model
```

# Build

- TODO: Add extra files (in build config / electron forg) for binaries e.g. whisper, ffmpeg, tesseract, models, ollama
    - Most important here is whisper with models and ffmpeg
- Warning: in webpack.main.config.ts for a PACKAGE build these lines need to be removed:
    - This needs to be reviewed to know what happens in the build process

```js
...
externals: [nodeExternals()], // Otherwise node_modules wont be exported in built
```

## Information

Inspired by Derrida.
