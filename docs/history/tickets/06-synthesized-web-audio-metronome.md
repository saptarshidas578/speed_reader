# 06 Synthesized Web Audio Metronome

## What to build
An auditory pacing metronome using the Web Audio API. When enabled, a subtle, synthesized micro-click plays at the start of each word flash (or chunk burst) to help readers lock into a steady rhythmic focus and suppress internal subvocalization. Users can toggle the metronome, adjust pitch (440–880 Hz), and adjust volume.

## Acceptance criteria
- [x] Uses browser `AudioContext` with zero external audio assets to generate an exponential decay micro-click.
- [x] Metronome clicks fire in exact synchrony with word transitions in the rAF clock loop.
- [x] Users can toggle the audio cadence metronome on/off.
- [x] Sliders exist for volume and pitch adjustment with instant audition preview.
- [x] Audio gracefully handles browser autoplay policy when playback begins.

## Blocked by
- 01 Scaffold and Core RSVP Engine

## Status
closed
