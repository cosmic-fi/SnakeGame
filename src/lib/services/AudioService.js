// @ts-nocheck
/**
 * AudioService.js
 * Handles game audio and sound effects
 */

export const AudioService = {
  // Audio context and sounds
  context: null,
  sounds: {},
  muted: false,
  volume: 1.0, // Volume level from 0.0 to 1.0
  gainNode: null, // Master gain node for volume control
  
  // Background music
  backgroundMusic: null,
  backgroundMusicSource: null,
  musicMuted: false,
  musicVolume: 0.2, // Lower volume for background music
  musicGainNode: null,
  
  /**
   * Initialize the audio service
   */
  init() {
    // Check if audio is already initialized
    if (this.context) return;
    
    // Create audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      
      // Create master gain node for volume control
      this.gainNode = this.context.createGain();
      this.gainNode.connect(this.context.destination);
      
      // Load sounds
      this.loadSounds();
      
      // Load settings from localStorage
      this.muted = localStorage.getItem('snakeGame_muted') === 'true';
      const savedVolume = localStorage.getItem('snakeGame_volume');
      this.volume = savedVolume ? parseFloat(savedVolume) : 1.0;
      
      this.musicMuted = localStorage.getItem('snakeGame_musicMuted') === 'true';
      const savedMusicVolume = localStorage.getItem('snakeGame_musicVolume');
      this.musicVolume = savedMusicVolume ? parseFloat(savedMusicVolume) : 0.3;
      
      this.updateVolume();
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  },
  
  /**
   * Load game sounds
   */
  loadSounds() {
    // Define sounds to load
    const soundsToLoad = [
      { name: 'eat', url: '/sfx/eat.wav' },
      { name: 'gameOver', url: '/sfx/death.wav' },
      { name: 'move', url: '/sfx/move.wav' },
      { name: 'powerUp', url: '/sfx/buff_pickup.wav' },
      { name: 'timeFreeze', url: '/sfx/buff_time_freeze.wav' },
      { name: 'buttonClick', url: '/sfx/eat.wav' }
    ];
    
    // Background music (separate handling for looping)
    this.loadBackgroundMusic('/sfx/bgm.mp3');
    
    // Load each sound
    soundsToLoad.forEach(sound => {
      this.loadSound(sound.name, sound.url);
    });
  },
  
  /**
   * Load a single sound
   */
  loadSound(name, url) {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.sounds[name] = audioBuffer;
      })
      .catch(error => {
        console.error(`Error loading sound ${name}:`, error);
      });
  },
  
  /**
   * Play a sound
   */
  playSound(name) {
    if (this.muted || !this.context || !this.sounds[name] || !this.gainNode) return;
    
    try {
      // Create source node
      const source = this.context.createBufferSource();
      source.buffer = this.sounds[name];
      
      // Connect through gain node for volume control
      source.connect(this.gainNode);
      source.start(0);
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
    }
  },
  
  /**
   * Play eat sound
   */
  playEatSound() {
    this.playSound('eat');
  },
  
  /**
   * Play game over sound
   */
  playGameOverSound() {
    this.playSound('gameOver');
  },
  
  /**
   * Play move sound
   */
  playMoveSound() {
    this.playSound('move');
  },
  

  
  /**
   * Play power-up sound
   */
  playPowerUpSound() {
    this.playSound('powerUp');
  },
  
  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('snakeGame_muted', this.muted.toString());
    return this.muted;
  },
  
  /**
   * Set mute state
   */
  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('snakeGame_muted', this.muted.toString());
    return this.muted;
  },
  
  /**
   * Get mute state
   */
  isMuted() {
    return this.muted;
  },
  
  /**
   * Set volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    localStorage.setItem('snakeGame_volume', this.volume.toString());
    this.updateVolume();
    return this.volume;
  },
  
  /**
   * Get current volume level
   */
  getVolume() {
    return this.volume;
  },
  
  /**
   * Update the gain node volume
   */
  updateVolume() {
    if (this.gainNode) {
      this.gainNode.gain.value = this.muted ? 0 : this.volume;
    }
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicMuted ? 0 : this.musicVolume;
    }
  },

  /**
   * Load background music
   */
  loadBackgroundMusic(url) {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.backgroundMusic = audioBuffer;
      })
      .catch(error => {
        console.error('Error loading background music:', error);
      });
  },

  /**
   * Play background music (looped)
   */
  playBackgroundMusic() {
    if (!this.context || !this.backgroundMusic || this.backgroundMusicSource) return;
    
    try {
      // Resume audio context if suspended (required for modern browsers)
      if (this.context.state === 'suspended') {
        this.context.resume().then(() => {
          this.startBackgroundMusic();
        });
        return;
      }
      
      this.startBackgroundMusic();
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  },

  /**
   * Internal method to start background music
   */
  startBackgroundMusic() {
    try {
      // Create music gain node if it doesn't exist
      if (!this.musicGainNode) {
        this.musicGainNode = this.context.createGain();
        this.musicGainNode.connect(this.context.destination);
        this.musicGainNode.gain.value = this.musicMuted ? 0 : this.musicVolume;
      }
      
      this.backgroundMusicSource = this.context.createBufferSource();
      this.backgroundMusicSource.buffer = this.backgroundMusic;
      this.backgroundMusicSource.loop = true;
      this.backgroundMusicSource.connect(this.musicGainNode);
      this.backgroundMusicSource.start();
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  },

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusicSource) {
      try {
        this.backgroundMusicSource.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.backgroundMusicSource = null;
    }
  },

  /**
   * Toggle background music mute
   */
  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    localStorage.setItem('snakeGame_musicMuted', this.musicMuted.toString());
    this.updateVolume();
    return this.musicMuted;
  },

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('snakeGame_musicVolume', this.musicVolume.toString());
    this.updateVolume();
    return this.musicVolume;
  },

  /**
   * Play button click sound
   */
  playButtonClickSound() {
    this.playSound('buttonClick');
  },

  /**
   * Play time freeze sound
   */
  playTimeFreezeSound() {
    this.playSound('timeFreeze');
  },

  /**
   * Stop all currently playing sounds
   */
  stopAllSounds() {
    // Stop background music
    this.stopBackgroundMusic();
    
    // Note: Individual sound effects created with createBufferSource()
    // are automatically cleaned up when they finish playing.
    // For longer sounds that might still be playing, we would need
    // to track their sources and stop them individually.
  }
};