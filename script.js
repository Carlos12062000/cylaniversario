(() => {
  const $ = (id) => document.getElementById(id);
  const toast = (message) => {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3000);
  };
  let editing = false;
  $('editButton').addEventListener('click', () => {
    editing = !editing;
    document.querySelectorAll('[contenteditable]').forEach(el => el.contentEditable = editing ? 'true' : 'false');
    $('editButton').textContent = editing ? '✓ Terminar edición' : '✎ Personalizar';
    if (editing) toast('Toca cualquier texto para editarlo. Tus cambios se mantienen mientras esta página esté abierta.');
    else toast('¡Listo! Recuerda editar el archivo HTML si quieres guardar los cambios para publicarlos.');
  });
  $('openLetter').addEventListener('click', () => $('carta').scrollIntoView({behavior:'smooth'}));
  $('goGallery').addEventListener('click', () => $('galeria').scrollIntoView({behavior:'smooth'}));
  $('musicTop').addEventListener('click', () => $('cancion').scrollIntoView({behavior:'smooth'}));
  $('secretButton').addEventListener('click', () => {
    const note = $('secretNote'); note.classList.toggle('show');
    $('secretButton').textContent = note.classList.contains('show') ? 'Cerrar mi secreto ♡' : 'Abrir mi secreto ♡';
    if (note.classList.contains('show')) note.scrollIntoView({behavior:'smooth',block:'center'});
  });
  const gallery = $('gallery');
  $('photoInput').addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length) return;
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const tile = document.createElement('div'); tile.className = 'photo has-image';
      const img = document.createElement('img'); img.src = url; img.alt = file.name || 'Un recuerdo de nosotros';
      const remove = document.createElement('button'); remove.className = 'remove'; remove.type = 'button'; remove.setAttribute('aria-label','Quitar foto'); remove.textContent = '×';
      remove.addEventListener('click', () => { URL.revokeObjectURL(url); tile.remove(); });
      tile.append(img, remove); gallery.append(tile);
    });
    toast(`${files.length} ${files.length === 1 ? 'foto agregada' : 'fotos agregadas'} a la galería.`);
    event.target.value = '';
  });
  $('resetGallery').addEventListener('click', () => {
    gallery.querySelectorAll('.photo.has-image').forEach(tile => { const img = tile.querySelector('img'); if (img) URL.revokeObjectURL(img.src); tile.remove(); });
    toast('Quité las fotos agregadas en esta vista.');
  });
  const audio = $('audio'); let audioUrl = null;
  $('audioInput').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0]; if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(file); audio.src = audioUrl; $('songName').textContent = file.name.replace(/\.[^.]+$/, ''); $('songHint').textContent = 'Tu canción está lista. Pulsa reproducir para escucharla.';
    $('playButton').textContent = '▶ Reproducir'; $('vinyl').classList.remove('playing'); toast('Canción cargada. ¡Que suene su recuerdo!');
  });
  $('playButton').addEventListener('click', async () => {
    if (!audio.src) { $('audioInput').click(); toast('Primero elige una canción de tu dispositivo.'); return; }
    if (audio.paused) {
      try { await audio.play(); $('playButton').textContent = 'Ⅱ Pausar'; $('vinyl').classList.add('playing'); }
      catch { toast('El navegador no pudo reproducir el archivo. Prueba con otro audio.'); }
    } else { audio.pause(); $('playButton').textContent = '▶ Reproducir'; $('vinyl').classList.remove('playing'); }
  });
  audio.addEventListener('ended', () => { $('playButton').textContent = '▶ Reproducir'; $('vinyl').classList.remove('playing'); });
  audio.addEventListener('pause', () => { $('playButton').textContent = '▶ Reproducir'; $('vinyl').classList.remove('playing'); });
  audio.addEventListener('play', () => { $('playButton').textContent = 'Ⅱ Pausar'; $('vinyl').classList.add('playing'); });
  const dateInput = $('startDate');
  const updateCounter = () => {
    if (!dateInput.value) { $('daysCount').textContent = '∞'; $('daysLabel').textContent = 'razones para seguir eligiéndote'; return; }
    const start = new Date(dateInput.value + 'T12:00:00'); const now = new Date(); now.setHours(12,0,0,0);
    const days = Math.floor((now - start) / 86400000);
    if (days < 0) { $('daysCount').textContent = '♡'; $('daysLabel').textContent = '¡esa fecha todavía está por llegar!'; }
    else { $('daysCount').textContent = days.toLocaleString('es-CO'); $('daysLabel').textContent = days === 1 ? 'día de nuestra historia' : 'días de nuestra historia'; }
  };
  dateInput.addEventListener('change', updateCounter); updateCounter();
})();

(() => {
  const $ = (id) => document.getElementById(id);
  const audio = $('annivAudio');
  const gallery = $('annivGallery');
  const photoInput = $('annivPhotoInput');
  const audioInput = $('annivAudioInput');
  let activeSlide = 0;
  let slideTimer = null;
  let audioUrl = null;
  const photoUrls = new Set();

  const getSlides = () => Array.from(gallery.querySelectorAll('.anniv-slide'));
  const loadProjectPhotos = () => {
    gallery.replaceChildren();
    for (let index = 1; index <= 49; index += 1) {
      const slide = document.createElement('div');
      slide.className = 'anniv-slide';
      const placeholder = document.createElement('div');
      placeholder.className = 'anniv-placeholder';
      const symbol = document.createElement('span');
      symbol.className = 'placeholder-symbol';
      symbol.textContent = String(index).padStart(2, '0');
      const title = document.createElement('strong');
      title.textContent = 'Un recuerdo nuestro';
      const hint = document.createElement('small');
      hint.textContent = 'Esta foto aparecerá aquí cuando esté en la carpeta fotos.';
      placeholder.append(symbol, title, hint);
      const img = document.createElement('img');
      img.alt = 'Recuerdo nuestro ' + index;
      img.addEventListener('load', () => placeholder.remove(), { once: true });
      const photoPath = 'fotos/foto-' + String(index).padStart(2, '0');
      let triedAlternativeExtension = false;
      img.addEventListener('error', () => {
        if (triedAlternativeExtension) {
          img.remove();
          return;
        }
        triedAlternativeExtension = true;
        img.src = photoPath + (img.src.toLowerCase().endsWith('.jpg') ? '.jpeg' : '.jpg');
      });
      img.src = photoPath + '.jpg';
      slide.append(img, placeholder);
      gallery.append(slide);
    }
  };
  const paintSlides = () => {
    const slides = getSlides();
    if (!slides.length) return;
    activeSlide = (activeSlide + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeSlide));
    $('annivSlideCount').textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };
  const stopSlideshow = () => {
    if (slideTimer) window.clearInterval(slideTimer);
    slideTimer = null;
    $('annivGalleryStatus').textContent = '';
  };
  const startSlideshow = () => {
    stopSlideshow();
    if (getSlides().length > 1 && !audio.paused) {
      $('annivGalleryStatus').textContent = '';
      slideTimer = window.setInterval(() => { activeSlide += 1; paintSlides(); }, 4500);
    }
  };

  $('annivReadLetter').addEventListener('click', () => $('annivCarta').scrollIntoView({ behavior: 'smooth' }));
  $('annivJumpGallery').addEventListener('click', () => $('annivGaleriaSection').scrollIntoView({ behavior: 'smooth' }));
  $('musicTop').addEventListener('click', () => $('annivSong').scrollIntoView({ behavior: 'smooth', block: 'center' }));
  $('annivPrev').addEventListener('click', () => { activeSlide -= 1; paintSlides(); });
  $('annivNext').addEventListener('click', () => { activeSlide += 1; paintSlides(); });

  photoInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/'));
    if (!files.length) return;
    photoUrls.forEach(url => URL.revokeObjectURL(url));
    photoUrls.clear();
    gallery.replaceChildren();
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      photoUrls.add(url);
      const slide = document.createElement('div');
      slide.className = 'anniv-slide';
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Recuerdo ${index + 1}: ${file.name}`;
      const caption = document.createElement('div');
      caption.className = 'anniv-slide-caption';
      caption.textContent = file.name.replace(/\.[^.]+$/, '') || `Un recuerdo nuestro · ${index + 1}`;
      slide.append(img, caption);
      gallery.append(slide);
    });
    activeSlide = 0;
    paintSlides();
    startSlideshow();
    $('annivGalleryStatus').textContent = audio.paused ? 'Fotos listas. Reproduce la canción para verlas pasar.' : '';
    event.target.value = '';
  });

  audioInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    stopSlideshow();
    audio.pause();
    audioUrl = URL.createObjectURL(file);
    audio.src = audioUrl;
    $('annivTrackTitle').textContent = file.name.replace(/\.[^.]+$/, '');
    $('annivTrackHint').textContent = 'Canción lista. Pulsa reproducir y el álbum cobrará vida.';
    $('annivPlay').textContent = '▶ ¡Te dedico esta canción!';
    $('annivDisc').classList.remove('is-playing');
    event.target.value = '';
  });

  $('annivPlay').addEventListener('click', async () => {
    if (!audio.src) { audioInput.click(); return; }
    if (audio.paused) {
      try {
        await audio.play();
        $('annivTrackHint').textContent = 'No toques nada, las fotos avanzan autompaticamente!';
      } catch {
        $('annivTrackHint').textContent = 'No se pudo reproducir. Elige otra canción e inténtalo de nuevo.';
      }
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', () => {
    $('annivPlay').textContent = 'Ⅱ Pausar';
    $('annivDisc').classList.add('is-playing');
    startSlideshow();
  });
  audio.addEventListener('pause', () => {
    $('annivPlay').textContent = '▶ ¡Te dedico esta canción!';
    $('annivDisc').classList.remove('is-playing');
    stopSlideshow();
  });

  $('annivGiftButton').addEventListener('click', () => {
    const note = $('annivGiftNote');
    const isOpen = note.classList.toggle('is-open');
    $('annivGiftButton').textContent = isOpen ? 'Cerrar sorpresa ♡' : 'Abrir sorpresa ♡';
    if (isOpen) note.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const updateCountdown = () => {
    const now = new Date();
    const target = new Date(2027, 9, 19, 0, 0, 0);
    const remaining = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    $('annivDays').textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
    $('annivHours').textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
    $('annivMinutes').textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    $('annivSeconds').textContent = String(totalSeconds % 60).padStart(2, '0');
  };
  loadProjectPhotos();
  paintSlides();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();
