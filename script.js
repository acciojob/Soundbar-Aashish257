//your JS code here. If required.
// script.js - soundboard behaviour
document.addEventListener('DOMContentLoaded', () => {
  // 1) Ensure there's a section#buttons and move existing buttons into it
  let buttonsSection = document.getElementById('buttons');
  if (!buttonsSection) {
    buttonsSection = document.createElement('section');
    buttonsSection.id = 'buttons';
    // create header and grid for nicer layout
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = '<h1>Soundbar</h1><p>Click a button to play a sound — put files in ./sounds/</p>';
    buttonsSection.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid';
    buttonsSection.appendChild(grid);

    // insert the new section at the top of body
    document.body.insertBefore(buttonsSection, document.body.firstChild);
  } else {
    // ensure there's a .grid inside; if not create
    if (!buttonsSection.querySelector('.grid')) {
      const grid = document.createElement('div');
      grid.className = 'grid';
      // move existing children (buttons) into grid later
      buttonsSection.appendChild(grid);
    }
  }

  // select grid container (where we'll place the buttons)
  const grid = buttonsSection.querySelector('.grid');

  // Find all existing buttons with class btn/stop that are not already inside #buttons .grid
  const allButtons = Array.from(document.querySelectorAll('button.btn, button.stop'));
  allButtons.forEach(b => {
    // move node into grid (preserve order)
    if (!grid.contains(b)) grid.appendChild(b);
  });

  // Map text content to sound file. By default uses lowercase trimmed text + .mp3 in "sounds" folder
  function filenameFromButton(btn) {
    // if a data-file attr is present, prefer it
    const dataFile = btn.getAttribute('data-file');
    if (dataFile) return dataFile;
    const label = (btn.textContent || btn.innerText || '').trim().toLowerCase();
    // remove non word characters except dash & underscore
    const safe = label.replace(/[^\w\-_]/g, '');
    return `${safe}.mp3`;
  }

  let currentAudio = null;
  let currentBtn = null;

  function playSoundForButton(btn) {
    const fname = filenameFromButton(btn);
    const src = `sounds/${fname}`;

    // stop currently playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (currentBtn) {
      currentBtn.classList.remove('playing');
      currentBtn.setAttribute('aria-pressed', 'false');
    }

    // create audio and play
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.play().catch(err => {
      console.error('Playback failed (file may be missing or blocked):', err);
      alert('Could not play sound: ' + src + '\nCheck that the file exists in the sounds/ folder and your browser allows audio playback.');
    });

    // update states
    currentAudio = audio;
    currentBtn = btn;
    btn.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');

    // when ends reset
    audio.addEventListener('ended', () => {
      if (currentBtn) currentBtn.classList.remove('playing');
      currentAudio = null;
      currentBtn = null;
    });

    // optional: show remaining time on button text (keeps original label by using dataset)
    const originalLabel = btn.dataset.label || btn.textContent;
    btn.dataset.label = originalLabel;
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration || audio.paused) return;
      const secLeft = Math.max(0, Math.ceil(audio.duration - audio.currentTime));
      btn.textContent = `${originalLabel} · ${secLeft}s`;
    });
    // restore label if paused/stopped
    audio.addEventListener('pause', () => {
      if (btn && btn.dataset.label) btn.textContent = btn.dataset.label;
    });
  }

  function stopPlayback() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (currentBtn) {
      currentBtn.classList.remove('playing');
      if (currentBtn.dataset.label) currentBtn.textContent = currentBtn.dataset.label;
      currentBtn = null;
    }
  }

  // attach click handlers to .btn
  const soundButtons = Array.from(grid.querySelectorAll('button.btn'));
  soundButtons.forEach((b, idx) => {
    // ensure label is nicely capitalized
    const label = (b.textContent || b.innerText || '').trim();
    b.textContent = label;
    b.setAttribute('role', 'button');
    b.setAttribute('aria-pressed', 'false');

    b.addEventListener('click', () => {
      playSoundForButton(b);
    });
  });

  // ensure there's exactly one stop button (use first if multiple)
  let stopButton = grid.querySelector('button.stop');
  if (!stopButton) {
    // try find outside grid
    stopButton = document.querySelector('button.stop');
    if (stopButton && !grid.contains(stopButton)) grid.appendChild(stopButton);
  }
  if (stopButton) {
    stopButton.addEventListener('click', stopPlayback);
  } else {
    // create a stop button if none exists
    const s = document.createElement('button');
    s.className = 'stop';
    s.type = 'button';
    s.textContent = 'stop';
    s.addEventListener('click', stopPlayback);
    grid.appendChild(s);
    stopButton = s;
  }

  // keyboard shortcuts: 1..N play, 0 stop
  window.addEventListener('keydown', (e) => {
    // ignore if typing in input/textarea
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

    const key = e.key;
    if (/^[1-9]$/.test(key)) {
      const idx = parseInt(key, 10) - 1;
      if (idx >= 0 && idx < soundButtons.length) {
        soundButtons[idx].click();
      }
    } else if (key === '0') {
      stopButton.click();
    }
  });

  // optional: expose stopPlayback globally for debugging
  window.soundbar = { playSoundForButton, stopPlayback };
});

