let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    // Update timestamp di navbar
    document.getElementById('timestamp').innerText = now.toLocaleDateString('id-ID', options);    
    // Update waktu di time-section
    document.getElementById('current-time').innerText = now.toLocaleDateString('id-ID', timeOptions);
}

setInterval(updateTime, 1000);
updateTime();

// Fungsi untuk memformat teks task
function formatTaskText(text) {
    if (!text) return '';
    return text.toLowerCase().trim()
               .replace(/\b\w/g, char => char.toUpperCase())
               .replace(/\s+/g, ' '); // Remove extra spaces between words
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const dueDateInput = document.getElementById('due_date');
    
    const formattedText = formatTaskText(taskInput.value);
    const priority = prioritySelect.value;
    let dueDate = dueDateInput.value;;

    // Validasi input
    if (!formattedText) {
        alert('Deskripsi tugas harus diisi!');
        taskInput.focus();
        return;
    }

    // Validasi Priority
    if (!priority) {
        alert('Silakan pilih priority!');
        prioritySelect.focus();
        return;
    }

     // Cek duplikasi tugas
    const isDuplicate = tasks.some(task => 
        formatTaskText(task.text) === formattedText
    );

    if (isDuplicate) {
        alert('Tugas sudah ada dalam daftar!');
        taskInput.value = formattedText;
        taskInput.focus();
        return;
    }

    // Set default date jika kosong
    if (!dueDate) {
        const today = new Date();
        dueDate = today.toISOString().split('T')[0];
        dueDateInput.value = dueDate;
    }

    // Buat task baru
    const newTask = {
        id: Date.now(),
        text: formattedText,
        priority: priority,
        date: new Date(dueDate),
        completed: false,
        completedTime: null
    };

    tasks.push(newTask);
    
    // Reset form
    taskInput.value = '';
    prioritySelect.value = ''; // Reset ke default
    dueDateInput.value = dueDate; // Pertahankan tanggal

    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedTime = task.completed ? new Date() : null;
        saveTasks();
        renderTasks();
    }
}

function deleteAllTasks() {
    if (tasks.length === 0) {
        alert('Tidak ada tugas yang bisa dihapus!');
        return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

function isOverdue(taskDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return new Date(taskDate) < today;
}

function renderTasks() {
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    // Sort by priority: High > Medium > Low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...tasks].sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority] ||
        new Date(a.date) - new Date(b.date)
    );

    sortedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.priority} ${!task.completed && isOverdue(task.date) ? 'overdue' : ''}`;
        
        const priorityText = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        const dueDate = new Date(task.date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        taskElement.innerHTML = `
            <div class="task-content">
                <div class="checkbox-wrapper">
                    <input type="checkbox" 
                           ${task.completed ? 'checked' : ''} 
                           onchange="toggleTask(${task.id})">
                    <div class="task-info ${task.completed ? 'completed' : ''}">
                        <p>${task.text}</p>
                        <small class="due-date ${!task.completed && isOverdue(task.date) ? 'overdue' : ''}">
                            ${dueDate}
                            ${!task.completed && isOverdue(task.date) ? ' (TERLAMBAT)' : ''}
                        </small>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="priority-badge ${task.priority}">${priorityText}</span>
                </div>
            </div>
        `;
        
        (task.completed ? doneList : todoList).appendChild(taskElement);
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
    // Set default date
    const today = new Date();
    document.getElementById('due_date').value = today.toISOString().split('T')[0];
    
    // Auto-format text when leaving input field
    document.getElementById('task-input').addEventListener('blur', function() {
        if (this.value.trim()) {
            this.value = formatTaskText(this.value);
        }
    });
    
    // Initialize time and render tasks
    updateTime();
    setInterval(updateTime, 1000);
    renderTasks();
});