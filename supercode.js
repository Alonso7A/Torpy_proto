// ------------------------- JAVASCRIPT (LÓGICA DEL JUEGO) -------------------------
(function(){
    // ----- ELEMENTOS DEL DOM -----
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreDisplay');
    const highScoreSpan = document.getElementById('highScoreDisplay');
    const resetBtn = document.getElementById('resetButton');
    const messageDiv = document.getElementById('gameMessage');

    // ----- CONFIGURACIÓN DEL JUEGO -----
    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    // ----- VARIABLES DEL JUEGO -----
    let score = 0;
    let highScore = 0;
    let gameActive = true;
    let animationFrameId = null;
    
    // ----- OBJETO ESTRELLA -----
    let star = {
        x: W/2,
        y: H/2,
        radius: 24,
        vx: 1.6,
        vy: 1.2
    };

    let baseSpeed = 1.6;
    let speedMultiplier = 1.0;
    
    // ----- FUNCIONES DE ALMACENAMIENTO -----
    function loadHighScore() {
        const saved = localStorage.getItem('catchStarHighScore');
        if(saved !== null && !isNaN(parseInt(saved))) {
            highScore = parseInt(saved);
        } else {
            highScore = 0;
        }
        highScoreSpan.innerText = highScore;
    }
    
    function saveHighScore() {
        if(score > highScore) {
            highScore = score;
            highScoreSpan.innerText = highScore;
            localStorage.setItem('catchStarHighScore', highScore);
            messageDiv.innerHTML = "🏆 ¡NUEVO RÉCORD! 🏆";
            setTimeout(() => {
                if(gameActive) messageDiv.innerHTML = "🌟 ¡Sigue atrapando estrellas! 🌟";
                else messageDiv.innerHTML = "💀 GAME OVER - Presiona REINICIAR 💀";
            }, 1500);
        }
    }
    
    function updateScoreUI() {
        scoreSpan.innerText = score;
    }
    
    // ----- AJUSTAR VELOCIDAD POR DIFICULTAD -----
    function updateDifficultySpeed() {
        let bonus = Math.floor(score / 5) * 0.08;
        let multiplier = 1 + Math.min(bonus, 2.2);
        speedMultiplier = multiplier;
        let currentSpeed = baseSpeed * speedMultiplier;
        let len = Math.hypot(star.vx, star.vy);
        if(len > 0.01) {
            let normX = star.vx / len;
            let normY = star.vy / len;
            star.vx = normX * currentSpeed;
            star.vy = normY * currentSpeed;
        } else {
            star.vx = currentSpeed * (Math.random() > 0.5 ? 1 : -1);
            star.vy = currentSpeed * (Math.random() > 0.5 ? 1 : -1);
        }
    }
    
    // ----- REINICIAR JUEGO -----
    function resetGame() {
        score = 0;
        gameActive = true;
        updateScoreUI();
        baseSpeed = 1.6;
        speedMultiplier = 1.0;
        star.x = W/2;
        star.y = H/2;
        let angle = Math.random() * Math.PI * 2;
        let spd = baseSpeed;
        star.vx = Math.cos(angle) * spd;
        star.vy = Math.sin(angle) * spd;
        if(Math.abs(star.vx) < 0.5) star.vx = star.vx > 0 ? 0.8 : -0.8;
        if(Math.abs(star.vy) < 0.5) star.vy = star.vy > 0 ? 0.8 : -0.8;
        
        messageDiv.innerHTML = "🌟 ¡Nueva partida! Haz clic en la estrella 🌟";
        setTimeout(() => {
            if(gameActive) messageDiv.innerHTML = "✨ ¡Rápido! Atrapa la estrella ✨";
        }, 1800);
        
        highScoreSpan.innerText = highScore;
    }
    
    // ----- COLISIÓN -----
    function checkStarCollision(clickX, clickY) {
        if(!gameActive) return false;
        const dx = clickX - star.x;
        const dy = clickY - star.y;
        const dist = Math.hypot(dx, dy);
        if(dist <= star.radius) {
            score++;
            updateScoreUI();
            messageDiv.innerHTML = "⭐ +1 PUNTO ⭐";
            setTimeout(() => {
                if(gameActive) messageDiv.innerHTML = "🎯 ¡Sigue así! 🎯";
                else if(!gameActive) messageDiv.innerHTML = "💀 GAME OVER - Reinicia 💀";
            }, 400);
            
            if(score > highScore) {
                saveHighScore();
            } else {
                highScoreSpan.innerText = highScore;
            }
            
            updateDifficultySpeed();
            relocateStarAwayFromClick(clickX, clickY);
            
            if(score % 12 === 0 && score > 0) {
                baseSpeed = Math.min(baseSpeed + 0.18, 4.2);
                updateDifficultySpeed();
            }
            return true;
        }
        return false;
    }
    
    function relocateStarAwayFromClick(clickX, clickY) {
        let newX, newY;
        let safe = 0;
        const minDistance = 100;
        do {
            newX = 30 + Math.random() * (W - 60);
            newY = 40 + Math.random() * (H - 80);
            safe++;
            if(safe > 50) break;
        } while (Math.hypot(newX - clickX, newY - clickY) < minDistance);
        
        star.x = Math.min(Math.max(newX, star.radius + 5), W - star.radius - 5);
        star.y = Math.min(Math.max(newY, star.radius + 5), H - star.radius - 5);
        
        let angleShift = (Math.random() - 0.5) * 0.8;
        let currentAngle = Math.atan2(star.vy, star.vx);
        let newAngle = currentAngle + angleShift;
        let spd = Math.hypot(star.vx, star.vy);
        if(spd < 0.5) spd = baseSpeed * speedMultiplier;
        star.vx = Math.cos(newAngle) * spd;
        star.vy = Math.sin(newAngle) * spd;
    }
    
    // ----- MOVIMIENTO Y REBOTES -----
    function updateMovement() {
        if(!gameActive) return;
        
        star.x += star.vx;
        star.y += star.vy;
        
        const leftBound = star.radius;
        const rightBound = W - star.radius;
        const topBound = star.radius;
        const bottomBound = H - star.radius;
        
        if(star.x < leftBound) {
            star.x = leftBound;
            star.vx = -star.vx;
        }
        if(star.x > rightBound) {
            star.x = rightBound;
            star.vx = -star.vx;
        }
        if(star.y < topBound) {
            star.y = topBound;
            star.vy = -star.vy;
        }
        if(star.y > bottomBound) {
            star.y = bottomBound;
            star.vy = -star.vy;
        }
        
        star.x = Math.min(Math.max(star.x, star.radius), W - star.radius);
        star.y = Math.min(Math.max(star.y, star.radius), H - star.radius);
    }
    
    // ----- DIBUJADO -----
    function drawBackgroundStars() {
        if(!window._bgStars){
            window._bgStars = [];
            for(let s=0; s<180; s++) {
                window._bgStars.push({
                    x: Math.random() * W, 
                    y: Math.random() * H, 
                    radius: 1 + Math.random() * 2, 
                    alpha: 0.4 + Math.random() * 0.6
                });
            }
        }
        for(let s of window._bgStars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 170, ${s.alpha * 0.6})`;
            ctx.fill();
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, W, H);
        drawBackgroundStars();
        
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#f9e45b";
        
        const gradient = ctx.createRadialGradient(star.x-5, star.y-5, 5, star.x, star.y, star.radius+4);
        gradient.addColorStop(0, '#FFE484');
        gradient.addColorStop(0.5, '#FFC857');
        gradient.addColorStop(1, '#E89F1A');
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "gold";
        ctx.strokeStyle = "#FFF5B0";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Puntas decorativas
        ctx.beginPath();
        for(let i = 0; i < 5; i++) {
            let angle = (i * 72 - 90) * Math.PI/180;
            let x1 = star.x + Math.cos(angle) * (star.radius + 6);
            let y1 = star.y + Math.sin(angle) * (star.radius + 6);
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(x1, y1);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFD966";
            ctx.stroke();
        }
        
        // Ojos
        ctx.beginPath();
        ctx.arc(star.x - 8, star.y - 5, 3, 0, Math.PI*2);
        ctx.arc(star.x + 8, star.y - 5, 3, 0, Math.PI*2);
        ctx.fillStyle = "#2E241F";
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(star.x - 9, star.y - 6, 1, 0, Math.PI*2);
        ctx.arc(star.x + 7, star.y - 6, 1, 0, Math.PI*2);
        ctx.fill();
        
        // Sonrisa
        ctx.beginPath();
        ctx.arc(star.x, star.y + 4, 9, 0.05, Math.PI - 0.05);
        ctx.strokeStyle = "#4a2a1a";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Brillo exterior
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius+5, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,215,0,0.2)";
        ctx.fill();
    }
    
    // ----- MANEJAR CLICKS -----
    function handleCanvasClick(e) {
        if(!gameActive) {
            messageDiv.innerHTML = "⚠️ Juego terminado, presiona REINICIAR ⚠️";
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if(e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        let canvasX = (clientX - rect.left) * scaleX;
        let canvasY = (clientY - rect.top) * scaleY;
        
        canvasX = Math.min(Math.max(canvasX, 0), W);
        canvasY = Math.min(Math.max(canvasY, 0), H);
        
        checkStarCollision(canvasX, canvasY);
    }
    
    // ----- BUCLE PRINCIPAL -----
    function gameLoop() {
        updateMovement();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // ----- EVENTOS -----
    function attachEvents() {
        canvas.addEventListener('mousedown', handleCanvasClick);
        canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });
        canvas.addEventListener('dragstart', (e) => e.preventDefault());
        canvas.addEventListener('selectstart', (e) => e.preventDefault());
    }
    
    // ----- INICIALIZACIÓN -----
    function init() {
        loadHighScore();
        resetGame();
        attachEvents();
        window._bgStars = null;
        drawBackgroundStars();
        gameLoop();
    }
    
    resetBtn.addEventListener('click', () => {
        resetGame();
        baseSpeed = 1.6;
        speedMultiplier = 1.0;
        let spd = baseSpeed;
        let angle = Math.random() * Math.PI * 2;
        star.vx = Math.cos(angle) * spd;
        star.vy = Math.sin(angle) * spd;
        gameActive = true;
        messageDiv.innerHTML = "🔄 Juego reiniciado. ¡A cazar estrellas! 🔄";
        setTimeout(() => {
            if(gameActive) messageDiv.innerHTML = "⭐ Haz clic sobre la estrella ⭐";
        }, 1800);
    });
    
    init();
})();