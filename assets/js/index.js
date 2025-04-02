let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    // Update timestamp di navbar
    document.getElementById('timestamp').innerText = now.toLocaleDateString('id-ID', options);
    
    // Update waktu di time-section
    document.getElementById('current-time').innerText = now.toLocaleDateString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

setInterval(updateTime, 1000);
updateTime();

function addTask() {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const dueDateInput = document.getElementById('due_date');
    
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    let dueDate = dueDateInput.value;

    // Validasi Task Description
    if (!taskText) {
        alert('Task description harus diisi!');
        taskInput.focus();
        return;
    }

    // Validasi Priority
    if (!priority) {
        alert('Silakan pilih priority!');
        prioritySelect.focus();
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
        text: taskText,
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
    task.completed = !task.completed;
    task.completedTime = task.completed ? new Date() : null;
    saveTasks();
    renderTasks();
}

function deleteAllTasks() {
    if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

function isOverdue(taskDate) {
    const today = new Date();
    return new Date(taskDate).toDateString() < today.toDateString();
}

function renderTasks() {
    const todoList = document.getElementById('todo-list');
    const doneList = document.getElementById('done-list');
    
    todoList.innerHTML = '';
    doneList.innerHTML = '';

    // Sort by priority: High > Medium > Low
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

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
                            ${!task.completed && isOverdue(task.date) ? ' (OVERDUE)' : ''}
                        </small>
                    </div>
                </div>
                <div class="task-actions">
                    <span class="priority-badge ${task.priority}">${priorityText}</span>
                </div>
            </div>
        `;

        if (task.completed) {
            doneList.appendChild(taskElement);
        } else {
            todoList.appendChild(taskElement);
        }
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due_date').value = today;
    
    // Initial render
    renderTasks();
});