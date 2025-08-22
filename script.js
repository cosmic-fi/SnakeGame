class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('game-overlay');
        
        // Score elements
        this.scoreElements = {
            current: document.getElementById('current-score'),
            header: document.getElementById('header-score'),
            high: document.getElementById('high-score'),
            headerHigh: document.getElementById('header-high-score'),
            length: document.getElementById('snake-length'),
            gameTime: document.getElementById('game-time'),
            gamesPlayed: document.getElementById('games-played'),
            bestStreak: document.getElementById('best-streak'),
            totalTime: document.getElementById('total-time'),
            totalFood: document.getElementById('total-food'),
            winRate: document.getElementById('win-rate')
        };
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.recentGamesContainer = document.getElementById('recent-games');
        
        // Game settings
        this.gridSize = 25;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{x: 10, y: 10}];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.gameStartTime = null;
        this.gameTime = 0;
        this.currentStreak = 0;
        
        // Statistics
        this.stats = this.loadStats();
        
        this.init();
    }
    
    init() {
        this.updateAllDisplays();
        this.generateFood();
        this.setupEventListeners();
        this.showGameOverlay('Ready to Play?', 'Click Start Game to begin your snake adventure!', 'fa-play-circle');
        this.draw();
    }
    
    loadStats() {
        const defaultStats = {
            highScore: 0,
            gamesPlayed: 0,
            bestStreak: 0,
            totalTime: 0,
            totalFood: 0,
            recentGames: []
        };
        
        try {
            const saved = localStorage.getItem('snakeGameStats');
            return saved ? {...defaultStats, ...JSON.parse(saved)} : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('snakeGameStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('Could not save stats to localStorage');
        }
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Canvas event listeners
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
            if (!this.gameRunning) {
                this.startGame();
            }
        });
        
        // Make canvas focusable
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.focus();
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        // Prevent scrolling for game keys
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd', 'p', 'f'].includes(key)) {
            e.preventDefault();
        }
        
        // Global controls
        if (key === ' ') {
            if (!this.gameRunning) {
                this.startGame();
            } else {
                this.togglePause();
            }
            return;
        }
        
        if (key === 'p') {
            if (this.gameRunning) {
                this.togglePause();
            }
            return;
        }
        
        if (key === 'f') {
            this.toggleFullscreen();
            return;
        }
        
        if (!this.gameRunning || this.gamePaused) return;
        
        // Movement controls - prevent reverse direction
        switch(key) {
            case 'arrowup':
            case 'w':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        // Reset game state completely
        this.snake = [{x: 10, y: 10}];
        this.score = 0;
        this.gameTime = 0;
        this.currentStreak = 0;
        this.generateFood();
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now();
        this.dx = 1;
        this.dy = 0;
        
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.hideGameOverlay();
        this.updateAllDisplays();
        
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
                this.updateGameTime();
                this.draw();
            }
        }, 120);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.innerHTML = this.gamePaused ? 
            '<i class="fas fa-play"></i> Resume' : 
            '<i class="fas fa-pause"></i> Pause';
        
        if (this.gamePaused) {
            this.showGameOverlay('Game Paused', 'Press Space or click Resume to continue', 'fa-pause-circle');
        } else {
            this.hideGameOverlay();
        }
    }
    
    resetGame() {
        clearInterval(this.gameLoop);
        
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameTime = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        this.updateAllDisplays();
        this.generateFood();
        this.showGameOverlay('Ready to Play?', 'Click Start Game to begin your snake adventure!', 'fa-play-circle');
        this.draw();
    }
    
    update() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.currentStreak++;
            this.stats.totalFood++;
            this.updateScoreDisplays();
            this.generateFood();
            
            // Add visual feedback for food eaten
            this.addScoreAnimation();
        } else {
            this.snake.pop();
        }
        
        this.updateSnakeLength();
    }
    
    generateFood() {
        let foodPosition;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (attempts < maxAttempts && 
                 this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }
    
    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle)
        this.drawGrid();
        
        // Draw snake with gradient and glow effect
        this.drawSnake();
        
        // Draw food with glow effect
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Snake head with glow
                this.ctx.shadowColor = '#27ae60';
                this.ctx.shadowBlur = 10;
                this.ctx.fillStyle = '#2ecc71';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Eyes
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 6;
                
                if (this.dx === 1) { // Moving right
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dx === -1) { // Moving left
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.dy === -1) { // Moving up
                    this.ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                } else { // Moving down
                    this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                }
            } else {
                // Snake body with gradient
                const alpha = Math.max(0.6, 1 - (index * 0.05));
                this.ctx.shadowColor = `rgba(39, 174, 96, ${alpha * 0.5})`;
                this.ctx.shadowBlur = 5;
                this.ctx.fillStyle = `rgba(39, 174, 96, ${alpha})`;
                this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
            }
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize + this.gridSize / 2;
        const y = this.food.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 3;
        
        // Glow effect
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.shadowBlur = 15;
        
        // Food circle with gradient
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#e74c3c');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Food highlight
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius/3, y - radius/3, radius/3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    updateGameTime() {
        if (this.gameStartTime) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.scoreElements.gameTime.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateScoreDisplays() {
        this.scoreElements.current.textContent = this.score;
        this.scoreElements.header.textContent = this.score;
        
        if (this.score > this.stats.highScore) {
            this.stats.highScore = this.score;
            this.updateHighScoreDisplays();
            this.addHighScoreAnimation();
        }
    }
    
    updateSnakeLength() {
        this.scoreElements.length.textContent = this.snake.length;
    }
    
    updateHighScoreDisplays() {
        this.scoreElements.high.textContent = this.stats.highScore;
        this.scoreElements.headerHigh.textContent = this.stats.highScore;
    }
    
    updateAllDisplays() {
        this.updateScoreDisplays();
        this.updateHighScoreDisplays();
        this.updateSnakeLength();
        this.updateStatsDisplays();
        this.updateRecentGames();
    }
    
    updateStatsDisplays() {
        this.scoreElements.gamesPlayed.textContent = this.stats.gamesPlayed;
        this.scoreElements.bestStreak.textContent = this.stats.bestStreak;
        this.scoreElements.totalFood.textContent = this.stats.totalFood;
        
        const totalMinutes = Math.floor(this.stats.totalTime / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            this.scoreElements.totalTime.textContent = `${hours}h ${minutes}m`;
        } else {
            this.scoreElements.totalTime.textContent = `${minutes}m`;
        }
        
        const winRate = this.stats.gamesPlayed > 0 ? 
            Math.round((this.stats.totalFood / this.stats.gamesPlayed) * 10) : 0;
        this.scoreElements.winRate.textContent = `${winRate}%`;
    }
    
    updateRecentGames() {
        if (this.stats.recentGames.length === 0) {
            this.recentGamesContainer.innerHTML = '<div class="no-games">No games played yet</div>';
            return;
        }
        
        const gamesHtml = this.stats.recentGames.slice(0, 5).map(game => {
            const date = new Date(game.date).toLocaleDateString();
            const time = new Date(game.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            return `
                <div class="recent-game">
                    <div class="game-info-left">
                        <div class="game-score">${game.score}</div>
                        <div class="game-date">${date} ${time}</div>
                    </div>
                    <div class="game-length">Length: ${game.length}</div>
                </div>
            `;
        }).join('');
        
        this.recentGamesContainer.innerHTML = gamesHtml;
    }
    
    addScoreAnimation() {
        this.scoreElements.current.classList.add('pulse');
        setTimeout(() => {
            this.scoreElements.current.classList.remove('pulse');
        }, 1000);
    }
    
    addHighScoreAnimation() {
        [this.scoreElements.high, this.scoreElements.headerHigh].forEach(element => {
            element.classList.add('new-high-score');
            setTimeout(() => {
                element.classList.remove('new-high-score');
            }, 3000);
        });
    }
    
    showGameOverlay(title, message, icon) {
        this.gameOverlay.innerHTML = `
            <div class="overlay-content">
                <i class="fas ${icon}"></i>
                <h2>${title}</h2>
                <p>${message}</p>
            </div>
        `;
        this.gameOverlay.classList.remove('hidden');
    }
    
    hideGameOverlay() {
        this.gameOverlay.classList.add('hidden');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        
        // Update statistics
        this.stats.gamesPlayed++;
        this.stats.totalTime += this.gameTime;
        
        if (this.currentStreak > this.stats.bestStreak) {
            this.stats.bestStreak = this.currentStreak;
        }
        
        // Add to recent games
        const gameRecord = {
            score: this.score,
            length: this.snake.length,
            date: Date.now(),
            time: this.gameTime
        };
        
        this.stats.recentGames.unshift(gameRecord);
        if (this.stats.recentGames.length > 10) {
            this.stats.recentGames.pop();
        }
        
        this.saveStats();
        this.updateAllDisplays();
        
        // Reset controls
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Show game over message
        let message = `Final Score: ${this.score} | Length: ${this.snake.length}`;
        if (this.score === this.stats.highScore && this.score > 0) {
            message += ' | NEW HIGH SCORE! 🏆';
        }
        
        this.showGameOverlay('Game Over', message, 'fa-skull-crossbones');
        
        // Reset current streak
        this.currentStreak = 0;
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// Add some utility functions for better UX
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.snakeGame && window.snakeGame.gameRunning && !window.snakeGame.gamePaused) {
        window.snakeGame.togglePause();
    }
});

// Store game instance globally for debugging
window.addEventListener('DOMContentLoaded', () => {
    window.snakeGame = new SnakeGame();
});