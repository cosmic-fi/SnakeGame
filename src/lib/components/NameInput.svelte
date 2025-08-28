<script>
  import { createEventDispatcher } from 'svelte';
  import { StorageService } from '../services/StorageService.js';
  import { AudioService } from '../services/AudioService.js';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Props
  export let playerName = '';
  
  // Local state
  let nameInput = playerName || '';
  let errorMessage = '';
  
  // Handle name submission
  function submitName() {
    AudioService.playButtonClickSound();
    // Validate name
    if (!nameInput || nameInput.trim() === '') {
      errorMessage = 'Please enter a name';
      return;
    }
    
    if (nameInput.trim().length < 2) {
      errorMessage = 'Name must be at least 2 characters';
      return;
    }
    
    if (nameInput.trim().length > 20) {
      errorMessage = 'Name must be at most 20 characters';
      return;
    }
    
    // Check for invalid characters
    const invalidCharsRegex = /[<>\\\/{};:]/;
    if (invalidCharsRegex.test(nameInput)) {
      errorMessage = 'Name contains invalid characters';
      return;
    }
    
    // Clear error message
    errorMessage = '';
    
    // Save name
    StorageService.savePlayerName(nameInput.trim());
    
    // Dispatch event
    dispatch('nameSubmit', nameInput.trim());
  }
  
  // Handle cancel
  function handleCancel() {
    AudioService.playButtonClickSound();
    dispatch('cancel');
  }
  
  // Handle key press
  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      submitName();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<div class="name-input-container">
  <h2>Enter Your Name</h2>
  
  <div class="input-group">
    <input
      type="text"
      bind:value={nameInput}
      placeholder="Your name"
      maxlength="20"
      on:keydown={handleKeyPress}
      autofocus
    />
    
    {#if errorMessage}
      <p class="error-message">{errorMessage}</p>
    {/if}
  </div>
  
  <div class="button-group">
    <button class="submit-button" on:click={submitName}>
      Submit
    </button>
    
    <button class="cancel-button" on:click={handleCancel}>
      Cancel
    </button>
  </div>
  
  <p class="hint">Press Enter to submit or Escape to cancel</p>
</div>

<style>
  .name-input-container {
    width: 100%;
    max-width: min(90vw, 600px);
    background: 
      linear-gradient(135deg, #FFF2EF 0%, #F2E6D9 100%);
    border-radius: 25px;
    padding: 40px;
    color: white;
    text-align: center;
    /* border: 1px solid rgba(0, 255, 136, 0.3); */
    /* box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 60px rgba(0, 255, 136, 0.2); */
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }
  
  .name-input-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 30%, #f7a5a56e 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, #f7a5a580 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
  
  h2 {
    font-size: clamp(
      calc(var(--zoom-adaptive-xl) * 0.8),
      calc(1.4vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-2xl) * 1.1)
    );
    margin-bottom: 25px;
    background: linear-gradient(45deg, #5D688A, #5D688A);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
    animation: gradientShift 3s ease-in-out infinite;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    /* text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); */
    letter-spacing: calc(1px * var(--zoom-font-scale));
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .input-group {
    margin-bottom: 25px;
  }
  
  input {
    width: 100%;
    padding: calc(15px * var(--zoom-font-scale)) calc(20px * var(--zoom-font-scale));
    font-size: clamp(
      calc(var(--zoom-adaptive-base) * 0.9),
      calc(1.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-large) * 1.1)
    );
    border-radius: 20px;
    border: 2px solid #F7A5A5;
    background: #fff2efb7;
    color: #5D688A;
    text-align: center;
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    letter-spacing: calc(1px * var(--zoom-font-scale));
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    box-sizing: border-box;
  }
  
  input::placeholder {
    color: #5d688a98;
    font-family: 'Orbitron', sans-serif;
  }
  
  input:focus {
    outline: none;
    border-color: #F7A5A5;
    box-shadow: 
      0 0 25px #F7A5A5,
      inset 0 0 10px rgba(0, 255, 136, 0.1);
    transform: scale(1.02);
  }
  
  .error-message {
    color: #ff4444;
    margin-top: 12px;
    font-size: clamp(
      calc(var(--zoom-adaptive-small) * 0.8),
      calc(2.5vw * var(--zoom-font-scale)),
      calc(var(--zoom-adaptive-base) * 0.9)
    );
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  
  .submit-button, .cancel-button {
    padding: 12px 25px;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    min-width: 120px;
  }
  
  .submit-button::before, .cancel-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  .submit-button:hover::before, .cancel-button:hover::before {
    left: 100%;
  }
  
  .submit-button {
    background: linear-gradient(45deg, #F7A5A5, #e08e8e);
    color: #000;
    box-shadow: 
      0 4px 15px #F7A5A5,
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px #F7A5A5,
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .cancel-button {
    background: linear-gradient(45deg, #ff4444, #ff6666);
    color: white;
    box-shadow: 
      0 4px 15px rgba(255, 68, 68, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .cancel-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(255, 68, 68, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  .submit-button:active, .cancel-button:active {
    transform: scale(0.98);
  }
  
  .hint {
    font-size: clamp(1rem, 2vw, 0.8rem);
    color: #5D688A;
    font-family: 'Orbitron', sans-serif;
    letter-spacing: 0.5px;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .name-input-container {
      padding: 30px 25px;
      max-width: 95vw;
    }
    
    .button-group {
      gap: 12px;
      margin-bottom: 18px;
    }
    
    .submit-button, .cancel-button {
      padding: 10px 20px;
      min-width: 100px;
    }
  }
  
  @media (max-width: 480px) {
    .name-input-container {
      padding: 25px 20px;
      border-radius: 20px;
    }
    
    input {
      padding: 12px 16px;
      border-radius: 15px;
    }
    
    .submit-button, .cancel-button {
      padding: 8px 16px;
      border-radius: 15px;
      min-width: 90px;
    }
    
    .button-group {
      gap: 10px;
      margin-bottom: 15px;
    }
  }
</style>