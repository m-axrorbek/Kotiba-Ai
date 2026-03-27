# KOTIBA AI

KOTIBA AI is a mobile-first Uzbek voice assistant for reminders. The product flow is simple:

`voice -> UzbekVoice STT -> text cleanup -> AI parse -> reminder -> notification + Lola TTS`

The UI is intentionally minimal, black and white, and optimized for fast reminder capture on phones.

## What Works Today

- Uzbek voice recording
- UzbekVoice STT transcription
- transcript review and manual correction before submit
- OpenAI-backed reminder analysis with local parser fallback
- reminder creation from messy Uzbek speech
- exact-time and relative-time parsing
- browser notification delivery
- Lola-style UzbekVoice TTS when a reminder triggers
- analytics page with empty-state UX
- global settings dock across pages

## Current UX Flow

1. Record voice.
2. Press `Matnga o'tkazish`.
3. Review the transcript.
4. Fix date or time if STT changed it.
5. Press `Tahrirlangan matnni yuborish`.
6. KOTIBA AI saves the reminder.
7. When time arrives, the app shows a notification and speaks the reminder.

## Tech Stack

### Frontend

- React + Vite
- React Router
- Zustand
- Tailwind CSS
- shadcn-style UI primitives
- Recharts

### Local/Serverless AI Layer

- UzbekVoice STT
- UzbekVoice TTS (`lola`)
- OpenAI Chat Completions for reminder analysis
- local parser fallback for stability

### Optional Local Backend

- Node.js + Express
- modular assistant service
- local development proxy for `/api/assistant/analyze`

## Project Structure

```text
api/
  assistant/analyze.js
  uzbekvoice/stt.js
  uzbekvoice/tts.js
server/
  src/
    app.js
    index.js
    modules/assistant/
src/
  components/
  hooks/
  i18n/
  lib/
    assistant/
      clean.js
      datetime.js
      openAiPrompt.js
      parse.js
    cleaner.js
    parser.js
    reminderSpeech.js
    speech.js
    uzbekVoice.js
  pages/
  store/
```

## Local Setup

1. Install dependencies:
   `npm install`
2. Install server dependencies:
   `cd server && npm install`
3. Create env files:
   `.env.example -> .env`
   `server/.env.example -> server/.env`
4. Start the app:
   `npm run dev`

`npm run dev` starts both:
- Vite frontend
- local Express server on `http://localhost:4000`

## Environment Variables

### Root `.env`

- `VITE_UZBEKVOICE_API_KEY`
- `VITE_UZBEKVOICE_TTS_KEY`
- `VITE_UZBEKVOICE_TTS_MODEL`
- `VITE_UZBEKVOICE_STT_URL`
- `VITE_UZBEKVOICE_TTS_URL`

### `server/.env`

- `PORT`
- `CLIENT_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Vercel Deployment

Set these variables in Vercel project settings:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `VITE_UZBEKVOICE_API_KEY`
- `VITE_UZBEKVOICE_TTS_KEY`
- `VITE_UZBEKVOICE_TTS_MODEL`
- `VITE_UZBEKVOICE_STT_URL=/api/uzbekvoice/stt`
- `VITE_UZBEKVOICE_TTS_URL=/api/uzbekvoice/tts`

The `api/` directory contains the Vercel serverless functions used in production.

## Important Notes

- If AI analysis fails, the local parser still tries to build a valid reminder.
- Missing time defaults to `09:00`.
- Relative phrases like `2 minutdan keyin` are supported.
- The safest flow is to review transcript text before sending, especially for dates and times.
- Reminder voice and notification work while the app tab is open. Closed-app push delivery is not implemented yet.

## Production Gaps

These are still future improvements, not finished features:

1. closed-app push delivery
2. real database persistence
3. background scheduler on the server
4. full end-to-end test suite
5. stronger chunk splitting for smaller frontend bundles
