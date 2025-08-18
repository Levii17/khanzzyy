// Configuration
const CONFIG = {
  pin: "1906",
  tracks: [
    { mp3: "assets/music/track1.mp3", ogg: "assets/music/track1.ogg", name: "Track 1" },
    { mp3: "assets/music/track2.mp3", ogg: "assets/music/track2.ogg", name: "Track 2" },
    { mp3: "assets/music/track3.mp3", ogg: "assets/music/track3.ogg", name: "Track 3" },
    { mp3: "assets/music/track4.mp3", ogg: "assets/music/track4.ogg", name: "Track 4" }
  ]
};

// State management
const state = {
  wrongAttempts: 0,
  enteredPin: "",
  currentSlide: 0,
  currentTrack: 0,
  autoLoop: false,
  startDate: null,
  confettiInterval: null,
  isVideoPlaying: false
};

// DOM elements
const elements = {
  lockScreen: document.getElementById('lock-screen'),
  videoScreen: document.getElementById('video-screen'),
  slideshow: document.getElementById('slideshow'),
  hint: document.getElementById('hint'),
  lockIcon: document.querySelector('.lock-icon'),
  keypad: document.getElementById('keypad'),
  pinDisplay: document.getElementById('pin-display'),
  loading: document.getElementById('loading'),
  video: document.getElementById('intro-video'),
  audio: document.getElementById('bg-music'),
  slides: document.querySelectorAll('.slide'),
  progressBar: document.getElementById('progress-bar'),
  countdown: document.getElementById('countdown'),
  trackInfo: document.getElementById('trackInfo')
};

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const preloadImages = () => {
  const imageUrls = [
    'assets/images/pic1.jpg',
    'assets/images/pic2.jpg',
    'assets/images/pic3.jpg',
    'assets/images/final_surprise.jpg'
  ];
  
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Audio management
class AudioManager {

  constructor() {
    this.setupAudio();
    this.setupControls();
  }

  setupAudio() {
    elements.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    elements.audio.addEventListener('error', (e) => {
      console.warn('Audio error:', e);
      this.nextTrack();
    });

    elements.audio.addEventListener('loadstart', () => {
      elements.trackInfo.textContent = `Loading ${CONFIG.tracks[state.currentTrack].name}...`;
    });

    elements.audio.addEventListener('canplay', () => {
      this.updateTrackInfo();
    });
  }

  setupControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevTrackBtn = document.getElementById('prevTrackBtn');
    const nextTrackBtn = document.getElementById('nextTrackBtn');
    
    playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    prevTrackBtn.addEventListener('click', () => this.prevTrack());
    nextTrackBtn.addEventListener('click', () => this.nextTrack());
  }

  loadTrack(index) {
    if (index < 0 || index >= CONFIG.tracks.length) return;
    
    const track = CONFIG.tracks[index];
    elements.audio.innerHTML = `
      <source src="${track.mp3}" type="audio/mpeg">
      <source src="${track.ogg}" type="audio/ogg">
    `;

    elements.audio.load();
    state.currentTrack = index;
    this.updateTrackInfo();
  }

  togglePlayPause() {
    const playPauseIcon = document.getElementById('playPauseIcon');
    const playPauseText = document.getElementById('playPauseText');
        
    if (elements.audio.paused) {
      elements.audio.play().catch(console.error);
      playPauseIcon.textContent = '⏸️';
      playPauseText.textContent = 'Pause';

      } else {
        elements.audio.pause();
        playPauseIcon.textContent = '▶️';
        playPauseText.textContent = 'Play';
      }

    }

      nextTrack() {
        const nextIndex = (state.currentTrack + 1) % CONFIG.tracks.length;
        this.loadTrack(nextIndex);
        if (!elements.audio.paused) {
          setTimeout(() => elements.audio.play().catch(console.error), 100);
        }
      }

      prevTrack() {
        const prevIndex = state.currentTrack === 0 ? CONFIG.tracks.length - 1 : state.currentTrack - 1;
        this.loadTrack(prevIndex);
        if (!elements.audio.paused) {
          setTimeout(() => elements.audio.play().catch(console.error), 100);
        }
      }

      updateTrackInfo() {
        elements.trackInfo.textContent = `${CONFIG.tracks[state.currentTrack].name} (${state.currentTrack + 1} of ${CONFIG.tracks.length})`;
      }

      startPlayback() {
        this.loadTrack(0);
        // Auto-play with user gesture fallback
        elements.audio.play().catch(() => {
          console.log('Autoplay prevented, user interaction required');
        });
      }
    }

    // Slideshow management
    class SlideshowManager {
      constructor() {
        this.setupControls();
        this.setupAutoLoop();
      }

      setupControls() {
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());
        
        const toggleLoop = document.getElementById('toggleLoop');
        toggleLoop.addEventListener('click', () => this.toggleAutoLoop());
      }

      setupAutoLoop() {
        setInterval(() => {
          if (state.autoLoop) {
            this.nextSlide();
          }
        }, 4000);
      }

      showSlide(index) {
        elements.slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === index);
        });
        
        const progress = ((index + 1) / elements.slides.length) * 100;
        elements.progressBar.style.width = `${progress}%`;
        
        state.currentSlide = index;
      }

      nextSlide() {
        const nextIndex = (state.currentSlide + 1) % elements.slides.length;
        this.showSlide(nextIndex);
      }

      prevSlide() {
        const prevIndex = state.currentSlide === 0 ? elements.slides.length - 1 : state.currentSlide - 1;
        this.showSlide(prevIndex);
      }

      toggleAutoLoop() {
        state.autoLoop = !state.autoLoop;
        const toggleLoop = document.getElementById('toggleLoop');
        const loopIcon = document.getElementById('loopIcon');
        
        if (state.autoLoop) {
          toggleLoop.innerHTML = '<span id="loopIcon">🔄</span><span>Auto-Loop: ON</span>';
        } else {
          toggleLoop.innerHTML = '<span id="loopIcon">➿</span><span>Auto-Loop: OFF</span>';
        }
      }
    }

    // PIN input management
    class PinManager {
      constructor() {
        this.setupKeypad();
      }

      setupKeypad() {
        // Mobile phone keypad layout with letters
        const keypadLayout = [
          { number: '1', letters: '' },
          { number: '2', letters: 'ABC' },
          { number: '3', letters: 'DEF' },
          { number: '4', letters: 'GHI' },
          { number: '5', letters: 'JKL' },
          { number: '6', letters: 'MNO' },
          { number: '7', letters: 'PQRS' },
          { number: '8', letters: 'TUV' },
          { number: '9', letters: 'WXYZ' },
          { number: '*', letters: '' },
          { number: '0', letters: '+' },
          { number: '#', letters: '' }
        ];

        // Create the standard mobile keypad layout (3x4 grid plus controls)
        keypadLayout.forEach((key, index) => {
          const button = document.createElement('button');
          button.className = 'key';
          button.setAttribute('role', 'gridcell');
          button.setAttribute('aria-label', `${key.number} ${key.letters}`);
          
          // Mobile phone keypad styling with number and letters
          button.innerHTML = `
            <div class="number">${key.number}</div>
            ${key.letters ? `<div class="letters">${key.letters}</div>` : ''}
          `;
          
          // Only add digits 0-9 to PIN, ignore * and #
          if (key.number >= '0' && key.number <= '9') {
            button.addEventListener('click', () => this.addDigit(key.number));
          } else {
            // Style * and # keys differently but make them non-functional for PIN
            button.style.opacity = '0.6';
            button.style.cursor = 'default';
          }
          
          elements.keypad.appendChild(button);
        });

        // Add backspace button (spans one grid cell)
        const backspaceBtn = document.createElement('button');
        backspaceBtn.className = 'key';
        backspaceBtn.id = 'backspace';
        backspaceBtn.setAttribute('aria-label', 'Backspace');
        backspaceBtn.innerHTML = '<div class="number">⌫</div>';
        backspaceBtn.addEventListener('click', () => this.removeDigit());
        elements.keypad.appendChild(backspaceBtn);

        // Add enter button (spans one grid cell)
        const enterBtn = document.createElement('button');
        enterBtn.className = 'key';
        enterBtn.id = 'enter';
        enterBtn.setAttribute('aria-label', 'Enter PIN');
        enterBtn.innerHTML = '<div class="number">✓</div>';
        enterBtn.addEventListener('click', () => this.checkPin());
        elements.keypad.appendChild(enterBtn);
      }

      addDigit(digit) {
        if (state.enteredPin.length < CONFIG.pin.length) {
          state.enteredPin += digit;
          this.updateDisplay();
          
          if (state.enteredPin.length === CONFIG.pin.length) {
            setTimeout(() => this.checkPin(), 200);
          }
        }
      }

      removeDigit() {
        state.enteredPin = state.enteredPin.slice(0, -1);
        this.updateDisplay();
      }

      updateDisplay() {
        elements.pinDisplay.textContent = '*'.repeat(state.enteredPin.length);
      }

      checkPin() {
        if (state.enteredPin === CONFIG.pin) {
          this.unlock();
        } else {
          this.handleWrongPin();
        }
      }

      handleWrongPin() {
        state.wrongAttempts++;
        state.enteredPin = "";
        this.updateDisplay();
        
        if (state.wrongAttempts >= 3) {
          elements.hint.style.display = "block";
        }
        
        // Visual feedback
        elements.lockScreen.classList.add('shake');
        setTimeout(() => elements.lockScreen.classList.remove('shake'), 600);
      }

      unlock() {
        elements.loading.style.display = 'block';
        elements.lockIcon.textContent = "🔓";
        elements.lockIcon.style.transform = "rotate(20deg)";
        
        setTimeout(() => {
          elements.lockScreen.style.display = "none";
          this.playIntroVideo();
        }, 800);
      }

      playIntroVideo() {
        elements.videoScreen.style.display = "block";
        state.isVideoPlaying = true;
        
        // Try to play video
        elements.video.play().then(() => {
          console.log('Video started playing');
        }).catch((error) => {
          console.log('Video autoplay failed, skipping to slideshow:', error);
          this.startSlideshow();
        });

        elements.video.addEventListener('ended', () => {
          this.startSlideshow();
        }, { once: true });

        // Fallback timeout
        setTimeout(() => {
          if (state.isVideoPlaying) {
            this.startSlideshow();
          }
        }, 10000);
      }

      startSlideshow() {
        state.isVideoPlaying = false;
        elements.videoScreen.style.display = "none";
        elements.slideshow.style.display = "block";
        
        this.startConfetti();
        state.startDate = new Date();
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 24 * 60 * 60 * 1000);
        
        // Start audio and slideshow
        audioManager.startPlayback();
        slideshowManager.showSlide(0);
      }

      startConfetti() {
        if (window.confetti) {
          confetti({ 
            particleCount: 200, 
            spread: 80, 
            origin: { y: 0.6 },
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
          });
          
          if (!state.confettiInterval) {
            state.confettiInterval = setInterval(() => {
              confetti({ 
                particleCount: 50, 
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
              });
            }, 8000);
          }
        }
      }

      updateCountdown() {
        if (!state.startDate) return;
        const now = new Date();
        const days = Math.floor((now - state.startDate) / (1000 * 60 * 60 * 24));
        elements.countdown.textContent = `It's been ${days} days since we started speaking without ghosting phases.`;
      }
    }

    // Initialize managers
    const pinManager = new PinManager();
    const audioManager = new AudioManager();
    const slideshowManager = new SlideshowManager();

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (elements.lockScreen.style.display !== 'none') {
        if (e.key >= '0' && e.key <= '9') {
          pinManager.addDigit(e.key);
        } else if (e.key === 'Backspace') {
          pinManager.removeDigit();
        } else if (e.key === 'Enter') {
          pinManager.checkPin();
        }
      } else if (elements.slideshow.style.display !== 'none') {
        switch(e.key) {
          case 'ArrowLeft':
            slideshowManager.prevSlide();
            break;
          case 'ArrowRight':
            slideshowManager.nextSlide();
            break;
          case ' ':
            e.preventDefault();
            audioManager.togglePlayPause();
            break;
          case 'ArrowUp':
            audioManager.prevTrack();
            break;
          case 'ArrowDown':
            audioManager.nextTrack();
            break;
        }
      }
    });

    // Touch gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      if (elements.slideshow.style.display !== 'none') {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            slideshowManager.nextSlide();
          } else {
            slideshowManager.prevSlide();
          }
        }
      }
    }

    // Performance optimizations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src && !img.src) {
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    });

    // Lazy load images
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });

    // Error handling
    window.addEventListener('error', (e) => {
      console.error('App error:', e.error);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (state.confettiInterval) {
        clearInterval(state.confettiInterval);
      }
      if (elements.audio) {
        elements.audio.pause();
      }
    });

    // Initialize app
    document.addEventListener('DOMContentLoaded', () => {
      preloadImages();
      pinManager.updateDisplay();
      
      // Set initial focus for accessibility
      if (elements.keypad.firstElementChild) {
        elements.keypad.firstElementChild.focus();
      }
    });

    // Service Worker for caching (optional)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
      });
    }