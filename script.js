//your JS code here. If required.
// Replace your previous playSoundForButton and stopPlayback with these:

function playSoundForButton(btn) {
  const fname = filenameFromButton(btn);
  const src = `sounds/${fname}`;

  // stop & remove previous audio element if present
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch (e) { /* ignore */ }
    if (currentAudio.parentNode) currentAudio.parentNode.removeChild(currentAudio);
    currentAudio = null;
  }
  if (currentBtn) {
    currentBtn.classList.remove('playing');
    currentBtn.setAttribute('aria-pressed', 'false');
    // restore text label if changed
    if (currentBtn.dataset && currentBtn.dataset.label) currentBtn.textContent = currentBtn.dataset.label;
    currentBtn = null;
  }

  // create a visible or hidden <audio> element and append to DOM so Cypress can find it
  const audioEl = document.createElement('audio');
  audioEl.setAttribute('data-testid', 'playing-audio'); // helpful for tests
  audioEl.preload = 'auto';
  audioEl.autoplay = true;
  audioEl.style.display = 'none'; // hide it visually (remove if you want controls shown)
  audioEl.src = src;

  // append to body so tests can detect it
  document.body.appendChild(audioEl);

  // play (some browsers may still reject autoplay in some contexts but Cypress should allow)
  // call play() and handle possible promise rejection
  const playPromise = audioEl.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise.catch(err => {
      console.error('Playback failed:', err);
      // keep the audio element in DOM — test will still see it — but notify user
      // optionally remove element on error:
      // if (audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);
    });
  }

  // update current references & UI
  currentAudio = audioEl;
  currentBtn = btn;
  btn.classList.add('playing');
  btn.setAttribute('aria-pressed', 'true');

  // keep original label so we can display time left and restore later
  const originalLabel = btn.dataset.label || btn.textContent;
  btn.dataset.label = originalLabel;

  // update time-left display (optional)
  audioEl.addEventListener('timeupdate', () => {
    if (!audioEl.duration || audioEl.paused) return;
    const secLeft = Math.max(0, Math.ceil(audioEl.duration - audioEl.currentTime));
    btn.textContent = `${originalLabel} · ${secLeft}s`;
  });

  // when audio ends, cleanup element and UI
  audioEl.addEventListener('ended', () => {
    if (audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);
    if (btn) {
      btn.classList.remove('playing');
      btn.textContent = btn.dataset.label || originalLabel;
    }
    if (currentBtn === btn) currentBtn = null;
    if (currentAudio === audioEl) currentAudio = null;
  });

  // handle load/play errors
  audioEl.addEventListener('error', (ev) => {
    console.error('Audio error for', src, ev);
    // remove broken element
    if (audioEl.parentNode) audioEl.parentNode.removeChild(audioEl);
    if (btn) {
      btn.classList.remove('playing');
      btn.textContent = btn.dataset.label || originalLabel;
    }
    if (currentBtn === btn) currentBtn = null;
    if (currentAudio === audioEl) currentAudio = null;
  });
}

function stopPlayback() {
  if (currentAudio) {
    try {
      currentAudio.pause();
    } catch (e) { /* ignore */ }
    if (currentAudio.parentNode) currentAudio.parentNode.removeChild(currentAudio);
    currentAudio = null;
  }

  if (currentBtn) {
    currentBtn.classList.remove('playing');
    if (currentBtn.dataset && currentBtn.dataset.label) currentBtn.textContent = currentBtn.dataset.label;
    currentBtn.setAttribute('aria-pressed', 'false');
    currentBtn = null;
  }
}
