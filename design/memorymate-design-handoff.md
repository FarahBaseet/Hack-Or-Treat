# BrainBridge home screen: implementation brief

Implement this home screen in the existing BrainBridge front end. Use the project's current framework, component and styling conventions (do not introduce a new framework). If there is no front end yet, use plain HTML/CSS/JS or whatever the repo already uses.

The audience may have memory difficulties, so clarity, big tap targets and calm colour matter more than decoration.

## Layout (mobile first, designed at 390 x 844, must also work at 320 and on desktop)

One vertical column, 14px gap between rows, page padding 28px top, 20px sides, 24px bottom.

1. **Greeting block** (no box, text sits on the background)
   - "Good afternoon": Fraunces 700, 34px, colour #E3F5EA. Greeting must follow the real time of day (morning / afternoon / evening).
   - Directly under it, 6px gap, on one line: "Today is" + the full date ("Saturday, October 31"). Both Fraunces 600, 20px. "Today is" is #E3F5EA, the date is #FFFFFF.
   - Under that, the current time: "2:22" Fraunces 700, 40px, #DCE3C6, then "PM" Fraunces 700, 20px, #DCE3C6, baseline aligned, 8px gap.
   - Date and time are live (update every minute from the device clock).
2. **"I'm lost" button**: full width, min-height 100px. Line 1 "I'm lost" Fraunces 700, 36px, #FF6B5E. Line 2 "Tap and we will help you get home" Atkinson Hyperlegible 16px, #FFFFFF. Centered. Keep the app's existing lost-flow behaviour on tap.
3. **Two buttons side by side** (CSS grid, 2 equal columns, 14px gap), each min-height 112px, icon (32px, stroke) above label, centered, Fraunces 700, 22px:
   - "Full day routine" (list icon), colour #DCE3C6. Opens the full day schedule.
   - "Who is this?" (camera icon), colour #D3DAE6. Opens the existing camera / face-recognition flow.
4. **Next up card**: padding 20px 22px, 14px gap.
   - Top row, space-between: "NEXT UP" (Atkinson 700, 14px, letter-spacing 0.12em, #CFF1DD) and a live countdown such as "in 38 minutes" (Atkinson 700, 15px, #B9D9C8).
   - Task title, biggest: Fraunces 700, 30px, #DCE3C6 (example: "Take your medicine").
   - Detail line: Fraunces 600, 22px, #FFFFFF (example: "The green pills").
   - Time, smallest: Atkinson 400, 18px, #B9D9C8 (example: "3:00 PM").
   - Button "I took them" with a check icon: min-height 60px, Fraunces 700, 22px, text #9CF5B5, fill rgba(255,255,255,0.08). On tap it switches to "Done. Tap to undo" (Fraunces 700, 20px) and tapping again undoes it. Persist the taken state per task, per day.
   - Content comes from the user's real schedule; the next upcoming task is shown. The strings above are sample data, not hard-coded copy.

## Box style (all boxes identical)

Every box and button uses the same style so they blend into the background:
- background `rgba(4,40,29,0.55)`
- border `1px solid rgba(207,241,221,0.3)`
- `border-radius: 0` (rectangular, no rounded corners anywhere)
- The only exception is the "I took them" button inside the Next up card, which uses fill `rgba(255,255,255,0.08)` with the same border.
- Differences between boxes come only from text colour and font, never from box fill.

## Page background

Green gradient with criss-cross diagonal lines:

```css
background:
  repeating-linear-gradient(45deg,  rgba(255,255,255,0.07) 0 2px, transparent 2px 24px),
  repeating-linear-gradient(-45deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 24px),
  linear-gradient(160deg, #117550 0%, #0A4A33 50%, #04281D 100%);
```

## Fonts

Load from Google Fonts: `Atkinson Hyperlegible` (400, 700) and `Fraunces` (600, 700). Fraunces for headings, times, button labels. Atkinson Hyperlegible for small supporting text. Fallbacks: `Georgia, serif` and `system-ui, sans-serif`.

## Design tokens

| Token | Value |
|---|---|
| text-soft | #E3F5EA |
| text-white | #FFFFFF |
| text-sage | #DCE3C6 |
| text-muted | #B9D9C8 |
| text-label | #CFF1DD |
| text-lost | #FF6B5E |
| text-routine | #DCE3C6 |
| text-who | #D3DAE6 |
| text-done | #9CF5B5 |
| box-fill | rgba(4,40,29,0.55) |
| box-border | rgba(207,241,221,0.3) |
| focus-ring | 3px solid #FFD98A, offset 3px |

## Accessibility (must keep)

- Use real `<button>` elements for every tappable thing. Icons are decorative (`aria-hidden="true"`).
- Minimum tap target 48px (all buttons above already exceed it).
- Visible keyboard focus ring (token above).
- Text contrast of at least 4.5:1 against the dark green background; do not lighten the background or darken the text.
- Do not rely on red vs green alone to mean anything. The "I'm lost" button is also the biggest, most prominent button.
- Respect large system font sizes: layouts must not clip when text grows (use min-height, not fixed height).

## Icons

Simple 24px stroke icons (stroke-width 2, round caps), drawn inline as SVG:
- list: `M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01`
- camera: `M4 8h3l2-3h6l2 3h3v11H4z` plus a circle `cx=12 cy=13 r=3.5`
- check: `M5 12.5l4.5 4.5L19 7.5` (stroke-width 3)

## Reference markup (plain HTML/CSS, adapt to the project's stack)

```html
<main class="home">
  <div class="greeting">
    <h1>Good afternoon</h1>
    <p class="dateline"><span>Today is</span> <strong>Saturday, October 31</strong></p>
    <p class="clock"><span class="time">2:22</span> <span class="ampm">PM</span></p>
  </div>

  <button class="box lost">
    <span class="lost-title">I'm lost</span>
    <span class="lost-sub">Tap and we will help you get home</span>
  </button>

  <div class="pair">
    <button class="box tile routine"><!-- list icon --> Full day routine</button>
    <button class="box tile who"><!-- camera icon --> Who is this?</button>
  </div>

  <section class="box next" aria-label="Next up">
    <div class="next-head"><span>NEXT UP</span><span>in 38 minutes</span></div>
    <div class="next-body">
      <div class="task">Take your medicine</div>
      <div class="detail">The green pills</div>
      <div class="when">3:00 PM</div>
    </div>
    <button class="took"><!-- check icon --> I took them</button>
  </section>
</main>
```

```css
.home { max-width: 430px; margin: 0 auto; min-height: 100vh; box-sizing: border-box;
  padding: 28px 20px 24px; display: flex; flex-direction: column; gap: 14px;
  font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; color: #fff; /* + page background above */ }
.box { background: rgba(4,40,29,.55); border: 1px solid rgba(207,241,221,.3); border-radius: 0; }
.pair { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.tile { min-height: 112px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 12px; font: 700 22px/1.15 'Fraunces', Georgia, serif; }
```

## Done when

- The screen matches the spec above at 390px wide and still looks right at 320px and on desktop.
- Greeting, date, time, "Next up" task and countdown use real data.
- "I took them" toggles and persists.
- All buttons are wired to their existing flows (lost, routine, who is this).
