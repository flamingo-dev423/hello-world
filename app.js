(() => {
    const STORAGE_KEY = 'todo-items-v1';
  
    /** @typedef {{ id: string; title: string; completed: boolean; createdAt: number }} Todo */
  
    /** @type {Todo[]} */
    let todos = [];
    /** @type {'all'|'active'|'completed'} */
    let currentFilter = 'all';
  
    // Elements
    const newTodoInput = document.getElementById('new-todo-input');
    const toggleAllCheckbox = document.getElementById('toggle-all');
    const todoList = document.getElementById('todo-list');
    const itemsLeft = document.getElementById('items-left');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('.filter'));
  
    function generateId() {
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
  
    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, currentFilter }));
    }
  
    function load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.todos)) todos = parsed.todos;
        if (parsed.currentFilter === 'all' || parsed.currentFilter === 'active' || parsed.currentFilter === 'completed') {
          currentFilter = parsed.currentFilter;
        }
      } catch (_) {
        // ignore
      }
    }
  
    function getFilteredTodos() {
      if (currentFilter === 'active') return todos.filter(t => !t.completed);
      if (currentFilter === 'completed') return todos.filter(t => t.completed);
      return todos;
    }
  
    function updateItemsLeft() {
      const count = todos.filter(t => !t.completed).length;
      itemsLeft.textContent = `${count} item${count === 1 ? '' : 's'} left`;
    }
  
    function updateClearCompletedState() {
      const hasCompleted = todos.some(t => t.completed);
      clearCompletedBtn.disabled = !hasCompleted;
    }
  
    function setActiveFilterButton() {
      filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === currentFilter;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
    }
  
    function render() {
      todoList.innerHTML = '';
      const items = getFilteredTodos();
      for (const todo of items) {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.dataset.id = todo.id;
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', 'Toggle complete');
  
        const title = document.createElement('input');
        title.type = 'text';
        title.className = 'title';
        title.value = todo.title;
        title.readOnly = true;
        title.setAttribute('aria-label', 'Todo title');
  
        const editBtn = document.createElement('button');
        editBtn.className = 'btn';
        editBtn.textContent = 'Edit';
  
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn danger';
        deleteBtn.textContent = 'Delete';
  
        li.appendChild(checkbox);
        li.appendChild(title);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
  
        checkbox.addEventListener('change', () => {
          todo.completed = checkbox.checked;
          save();
          updateItemsLeft();
          updateClearCompletedState();
          render();
        });
  
        function enterEditMode() {
          title.readOnly = false;
          title.classList.add('edit-input');
          title.classList.remove('title');
          title.focus();
          title.setSelectionRange(title.value.length, title.value.length);
        }
  
        function exitEditMode(commit) {
          if (commit) {
            const trimmed = title.value.trim();
            if (trimmed.length === 0) {
              // delete empty title
              todos = todos.filter(t => t.id !== todo.id);
            } else {
              todo.title = trimmed;
            }
            save();
          }
          render();
        }
  
        editBtn.addEventListener('click', () => enterEditMode());
        title.addEventListener('dblclick', () => enterEditMode());
        title.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') exitEditMode(true);
          if (e.key === 'Escape') exitEditMode(false);
        });
        title.addEventListener('blur', () => exitEditMode(true));
  
        deleteBtn.addEventListener('click', () => {
          todos = todos.filter(t => t.id !== todo.id);
          save();
          updateItemsLeft();
          updateClearCompletedState();
          render();
        });
      }
  
      // toggle-all checkbox reflects state
      const hasTodos = todos.length > 0;
      toggleAllCheckbox.checked = hasTodos && todos.every(t => t.completed);
  
      updateItemsLeft();
      updateClearCompletedState();
      setActiveFilterButton();
    }
  
    function addTodo(title) {
      const trimmed = title.trim();
      if (!trimmed) return;
      const todo = { id: generateId(), title: trimmed, completed: false, createdAt: Date.now() };
      todos.unshift(todo);
      save();
      render();
    }
  
    // Events
    newTodoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTodo(newTodoInput.value);
        newTodoInput.value = '';
      }
    });
  
    toggleAllCheckbox.addEventListener('change', () => {
      const shouldCompleteAll = toggleAllCheckbox.checked;
      todos = todos.map(t => ({ ...t, completed: shouldCompleteAll }));
      save();
      render();
    });
  
    clearCompletedBtn.addEventListener('click', () => {
      todos = todos.filter(t => !t.completed);
      save();
      render();
    });
  
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter === 'all' || filter === 'active' || filter === 'completed') {
          currentFilter = filter;
          save();
          render();
        }
      });
    });
  
    // Init
    load();
    setActiveFilterButton();
    render();
  })();
  
  