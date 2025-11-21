// script.js - minimal soundboard: click a .btn to play, .stop to stop

document.addEventListener('DOMContentLoaded', () => {
  // create single audio element and append to body so tests can find it
  const audio = document.createElement('audio');
  audio.setAttribute('data-testid', 'playing-audio'); // helpful for tests
  audio.preload = 'auto';
  audio.style.display = 'none'; // keep hidden; remove if you want visible controls
  document.body.appendChild(audio);

  // simple helper: button label -> filename (e.g. "applause" -> "applause.mp3")
  function filenameFromButton(btn) {
    const override = btn.getAttribute('data-file');
    if (override) return override;
    const label = (btn.textContent || btn.innerText || '').trim().toLowerCase();
    const safe = label.replace(/[^\w\-_]/g, ''); // remove spaces/punct except - _
    return `${safe}.mp3`;
  }

  // play when a .btn is clicked
  const soundButtons = Array.from(document.querySelectorAll('button.btn'));
  soundButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const file = filenameFromButton(btn);
      audio.src = `sounds/${file}`;
      // reset to start and play
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(err => {
          // usually autoplay errors won't happen because click initiated playback,
          // but log if file is missing or other error occurs.
          console.error('Playback error for', audio.src, err);
        });
      }
      // visually mark playing (optional)
      soundButtons.forEach(b => b.classList.remove('playing'));
      btn.classList.add('playing');
    });
  });

  // stop button: pause and reset
  const stopBtn = document.querySelector('button.stop');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      audio.pause();
      audio.currentTime = 0;
      soundButtons.forEach(b => b.classList.remove('playing'));
    });
  }
});
