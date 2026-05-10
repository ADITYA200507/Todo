/* ═══════════════════════════════════════════════════════════
   PREMIUM TASK MANAGER - JAVASCRIPT
   Features: Add/Delete/Complete tasks, Filtering, Animations, localStorage
═══════════════════════════════════════════════════════════ */

// ===== STATE MANAGEMENT =====
let tasks = [];
let currentFilter = 'all';
const STORAGE_KEY = 'taskManagerData';

// ===== DOM ELEMENTS =====
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const activeCount = document.getElementById('activeCount');
const totalCount = document.getElementById('totalCount');
const progressPercent = document.getElementById('progressPercent');
const progressCircle = document.getElementById('progressCircle');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const particleContainer = document.getElementById('particleContainer');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    setupEventListeners();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', handleAddTask);

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Clear completed button
    clearBtn.addEventListener('click', handleClearCompleted);

    // Enter key in input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask(e);
        }
    });
}

/* ═══════════════════════════════════════════════════════════
   ADD TASK
═══════════════════════════════════════════════════════════ */
function handleAddTask(e) {
    e.preventDefault();

    const text = taskInput.value.trim();

    // Validation
    if (text === '') {
        shakeInput();
        return;
    }

    if (text.length > 100) {
        taskInput.value = '';
        showNotification('Task text is too long!', 'error');
        return;
    }

    // Create task object
    const task = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: new Date().getTime()
    };

    // Add to state
    tasks.unshift(task);

    // Clear input
    taskInput.value = '';
    taskInput.focus();

    // Update UI
    saveTasks();
    renderTasks();

    // Show celebration
    showCelebration('Task added! 🎉');
}

/* ═══════════════════════════════════════════════════════════
   COMPLETE/TOGGLE TASK
═══════════════════════════════════════════════════════════ */
function handleToggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;

    // Celebration effect when completing
    if (task.completed) {
        createDustEffect(event.target.closest('.task-item'));
        showCelebration('Great! One less task! ✨');
    }

    saveTasks();
    renderTasks();
}

/* ═══════════════════════════════════════════════════════════
   DELETE TASK
═══════════════════════════════════════════════════════════ */
function handleDeleteTask(id) {
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);

    // Animation
    if (taskElement) {
        taskElement.classList.add('remove');

        taskElement.addEventListener('animationend', () => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            showCelebration('Task removed!');
        }, { once: true });
    } else {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

/* ═══════════════════════════════════════════════════════════
   FILTER TASKS
═══════════════════════════════════════════════════════════ */
function handleFilter(e) {
    const filter = e.target.closest('.filter-btn').dataset.filter;
    currentFilter = filter;

    // Update active button
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.closest('.filter-btn').classList.add('active');

    // Re-render with animation
    renderTasks();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

/* ═══════════════════════════════════════════════════════════
   CLEAR COMPLETED TASKS
═══════════════════════════════════════════════════════════ */
function handleClearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        showNotification('No completed tasks to clear', 'info');
        return;
    }

    // Confirm action
    if (confirm(`Clear ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        showCelebration('Cleaned up! ✨');
    }
}

/* ═══════════════════════════════════════════════════════════
   RENDER TASKS
═══════════════════════════════════════════════════════════ */
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    // Clear list
    taskList.innerHTML = '';

    // Render tasks
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.taskId = task.id;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    aria-label="Toggle task completion"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="task-delete" aria-label="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

            // Checkbox listener
            li.querySelector('.task-checkbox').addEventListener('change', () => {
                handleToggleTask(task.id);
            });

            // Delete listener
            li.querySelector('.task-delete').addEventListener('click', () => {
                handleDeleteTask(task.id);
            });

            taskList.appendChild(li);
        });
    }

    // Update counters and progress
    updateCounters();
    updateProgressIndicator();
    updateClearButton();
}

/* ═══════════════════════════════════════════════════════════
   UPDATE COUNTERS
═══════════════════════════════════════════════════════════ */
function updateCounters() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    activeCount.textContent = active;
    totalCount.textContent = total;

    // Animate counter change
    activeCount.style.animation = 'none';
    setTimeout(() => {
        activeCount.style.animation = 'scaleIn 0.3s ease-out';
    }, 10);
}

/* ═══════════════════════════════════════════════════════════
   UPDATE PROGRESS INDICATOR
═══════════════════════════════════════════════════════════ */
function updateProgressIndicator() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Update percentage text
    progressPercent.textContent = percent;

    // Update SVG circle
    const circumference = 2 * Math.PI * 36; // radius = 36
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    progressCircle.style.strokeDashoffset = strokeDashoffset;

    // Celebrate 100%
    if (percent === 100 && total > 0) {
        setTimeout(() => {
            createConfetti();
            showCelebration('🎉 All tasks completed! You\'re amazing!');
        }, 500);
    }
}

/* ═══════════════════════════════════════════════════════════
   UPDATE CLEAR BUTTON VISIBILITY
═══════════════════════════════════════════════════════════ */
function updateClearButton() {
    const hasCompleted = tasks.some(t => t.completed);
    clearBtn.style.display = hasCompleted ? 'flex' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════════════════════ */
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Failed to save tasks:', e);
    }
}

function loadTasks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load tasks:', e);
        tasks = [];
    }
}

/* ═══════════════════════════════════════════════════════════
   ANIMATIONS & EFFECTS
═══════════════════════════════════════════════════════════ */

// Dust/Particle effect when task completes
function createDustEffect(element) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = `hsl(${Math.random() * 60 + 40}, 70%, 60%)`;
        particle.style.borderRadius = '50%';
        particle.style.opacity = '1';

        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 3;
        const tx = Math.cos(angle) * velocity * 30;
        const ty = Math.sin(angle) * velocity * 30;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animation = `dust 0.6s ease-out forwards`;

        particleContainer.appendChild(particle);

        setTimeout(() => particle.remove(), 600);
    }
}

// Confetti effect for 100% completion
function createConfetti() {
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = [
            '#FBB45E',
            '#C99769',
            '#353B56',
            '#7D7585'
        ][Math.floor(Math.random() * 4)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';

        particleContainer.appendChild(confetti);

        const duration = 2 + Math.random() * 1;
        const startY = 0;
        const endY = window.innerHeight;
        const startX = parseFloat(confetti.style.left);
        const swayAmount = (Math.random() - 0.5) * 100;

        confetti.animate([
            {
                transform: `translateY(${startY}px) translateX(0)`,
                opacity: 1
            },
            {
                transform: `translateY(${endY}px) translateX(${swayAmount}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => confetti.remove(), duration * 1000);
    }
}

// Shake input on empty submission
function shakeInput() {
    taskInput.style.animation = 'none';
    setTimeout(() => {
        taskInput.style.animation = 'shake 0.3s ease-in-out';
    }, 10);

    setTimeout(() => {
        taskInput.style.animation = '';
    }, 300);
}

// Show notification/celebration message
function showCelebration(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FBB45E, #C99769);
        color: #251211;
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.4s ease-out;
        box-shadow: 0 8px 24px rgba(251, 180, 94, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.4s ease-out forwards';
        setTimeout(() => notification.remove(), 400);
    }, 2500);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        info: 'rgba(251, 180, 94, 0.2)',
        error: 'rgba(255, 107, 107, 0.2)'
    };
    const textColors = {
        info: '#FBB45E',
        error: '#ff6b6b'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: ${textColors[type] || textColors.info};
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.4s ease-out;
        border: 1px solid ${textColors[type] || textColors.info}40;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.4s ease-out forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

/* ═══════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════ */

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* ═══════════════════════════════════════════════════════════
   SHAKE ANIMATION (CSS)
═══════════════════════════════════════════════════════════ */
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }
`;
document.head.appendChild(style);

console.log('✓ Task Manager Ready - localStorage enabled');t