(function () {
  const STAR_COUNT = 150;
  const COMPLETE_FRAME = 180;
  const colors = ['#00E5FF', '#00AEB2', '#72DBE0', '#ffffff', '#ffffff', '#ffffff'];

  document.addEventListener('DOMContentLoaded', function () {
    const preloader = document.getElementById('preloader');
    const canvas = document.getElementById('particleCanvas');
    const galaxyBg = document.getElementById('galaxyBg');

    if (!preloader || !canvas || !galaxyBg) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let animationId;
    let frame = 0;
    let particles = [];

    document.body.classList.add('preloader-active');
    resizeCanvas();
    createGalaxyBackground();

    const logoPoints = generateLogoPoints();
    particles = createParticles(logoPoints);
    animate();

    window.addEventListener('resize', function () {
      resizeCanvas();
    });

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createGalaxyBackground() {
      galaxyBg.innerHTML = '';

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        galaxyBg.appendChild(star);
      }

      const spiral = document.createElement('div');
      spiral.className = 'galaxy-spiral';
      galaxyBg.appendChild(spiral);
    }

    function generateLogoPoints() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 800;
      const points = [];

      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI;
        const radius = 100 * scale;
        points.push({
          x: centerX - 150 * scale + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius * 0.7
        });
      }

      for (let i = 0; i < 25; i++) {
        const angle = Math.PI + (i / 25) * Math.PI;
        const radius = 80 * scale;
        points.push({
          x: centerX + 50 * scale + Math.cos(angle) * radius,
          y: centerY - 80 * scale + Math.sin(angle) * radius
        });
      }

      for (let i = 0; i < 25; i++) {
        const angle = -Math.PI / 2 + (i / 25) * Math.PI;
        const radius = 40 * scale;
        points.push({
          x: centerX + 130 * scale + Math.cos(angle) * radius,
          y: centerY - 120 * scale + Math.sin(angle) * radius
        });
      }

      for (let i = 0; i < 25; i++) {
        const angle = Math.PI / 2 + (i / 25) * Math.PI;
        const radius = 40 * scale;
        points.push({
          x: centerX + 130 * scale + Math.cos(angle) * radius,
          y: centerY - 40 * scale + Math.sin(angle) * radius
        });
      }

      for (let i = 0; i < 100; i++) {
        points.push({
          x: centerX + (Math.random() - 0.5) * 300 * scale,
          y: centerY + (Math.random() - 0.5) * 150 * scale
        });
      }

      return points;
    }

    function createParticles(pointList) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      return pointList.map(point => new Particle(point.x, point.y, centerX, centerY));
    }

    class Particle {
      constructor(targetX, targetY, centerX, centerY) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 500;
        this.x = centerX + Math.cos(angle) * distance;
        this.y = centerY + Math.sin(angle) * distance;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = 0;
        this.vy = 0;
        this.size = 2 + Math.random() * 3;
        this.opacity = 0;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
          this.vx += dx * 0.001;
          this.vy += dy * 0.001;
          this.vx *= 0.95;
          this.vy *= 0.95;
          this.x += this.vx;
          this.y += this.vy;
          this.opacity = Math.min(1, 1 - distance / 500);
        } else {
          this.opacity = 1;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      frame++;

      if (frame > COMPLETE_FRAME) {
        setTimeout(() => {
          completePreloader();
        }, 500);
        return;
      }

      animationId = requestAnimationFrame(animate);
    }

    function completePreloader() {
      cancelAnimationFrame(animationId);
      preloader.classList.add('hidden');
      document.body.classList.remove('preloader-active');
      setTimeout(() => {
        if (typeof window.onPreloaderComplete === 'function') {
          window.onPreloaderComplete();
        }
      }, 800);
    }
  });
})();

