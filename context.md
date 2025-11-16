## Context: Nepali Language Learning Web App (Core)

### Vision & Scope
- Teach practical Nepali via context-rich reading and listening, prioritizing paragraphs and songs over isolated vocabulary.
- Emphasize comprehension, fluency, pronunciation, and cultural understanding.

### Core Learning Model
- Comprehensible input: leveled texts and songs with line-by-line gloss and translations.
- Form-meaning mapping: click-to-gloss with morphology and examples.
- Spaced repetition (SRS): auto-generate review items from studied content.
- Multimodal practice: Read → Listen → Practice (cloze/dictation) → Review.

### Core Learner Features
- Paragraph Reader: sentence segmentation, per-sentence audio, click-to-gloss, interlinear mode, romanization toggle, quick-add to SRS.
- Song/Karaoke: timed lyrics with auto-scroll, A–B loop, tempo control, per-line translation/gloss, create cloze/listening cards, optional recording for shadowing.
- Exercises: comprehension, cloze, dictation, sentence ordering; generated from lesson content.
- SRS: definition/cloze/audio→type/phrase recall cards; scheduler similar to SM‑2; decks auto-populated from studied content.
- Dictionary & Morphology: Nepali↔English lookup, frequency hints, examples from app corpus; basic morphological hints with manual overrides.
- Script & Input: optimized Devanagari, transliteration input, on-screen keyboard, romanization toggle.

### Minimal Authoring (CMS)
- Roles: Author, Editor, Admin.
- Paragraph workflow: add text → segment → gloss → translate → attach sentence audio → publish.
- Song workflow: upload audio → add lyrics → align timings → gloss/translate → publish.
- Tools: alignment editor (sentence/line), gloss editor with suggestions, versioned drafts.

### Essential Data Model (High-Level)
- User(id, email, roles, settings)
- Lesson(id, type: paragraph|song, level, topics, status)
- Paragraph(id, lessonId, text)
- Sentence(id, paragraphId, text, audioUrl, startMs?, endMs?)
- Song(id, lessonId, title, artist?, license, audioUrl)
- LyricLine(id, songId, text, startMs, endMs)
- Gloss(id, headword, senses[], examples[])
- Token(id, sentenceId|lyricLineId, surface, lemma?, pos?, glossId?)
- Translation(id, targetRef, type: literal|natural, text)
- Exercise(id, lessonId, type, prompt, mediaRefs, answerSchema)
- Card(id, userId, sourceRef, cardType, fields, due, ease, lapses)
- ReviewLog(id, cardId, rating, deltaMs, ts)
- Media(id, url, kind, durationMs)

### Architecture (Minimal)
- Frontend: Next.js (App Router), TypeScript, PWA, React Query, WebAudio API.
- Backend: Next.js API routes (MVP), background jobs later; REST endpoints.
- Storage: Local JSON (MVP) → PostgreSQL + S3 later; MeiliSearch for lookup.
- Auth: Email/password (later); roles for CMS.

### MVP Acceptance
- Paragraph study: read with glosses, hear sentence audio, complete ≥5 questions, add ≥10 items to SRS.
- Song study: synced lyrics, loop a line, slow to 0.75×, view translation, create cloze from a line in ≤3 clicks.
- SRS: stable daily queue with persistence, consistent due counts.
- CMS: create/segment/publish a paragraph; upload and align a song; add gloss/translation; publish.

### Constraints & Risks
- Song licensing: start with originals/public domain; expand later.
- STT quality: MVP recording only; automated feedback optional later.
- Morph coverage: begin basic; allow manual overrides in CMS.


