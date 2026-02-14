class TodoApp {
    constructor()  {
        Object.assign(this, {
            input: document.getElementById("todoInput"),
            btn: document.getElementById("addBtn"),
            list: document.getElementById("todoList"),
            count: document.getElementById("todoCount"),
            todos: [],
            editId: null,
            apiUrl: "/api"
        });
        this.init();
    }

    init() {
        this.btn.onclick = () => this.add();
        this.input.addEventListener("keypress", e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), this.add()));
        this.loadTodos();
    }

    async loadTodos() {
        try {
            const res = await fetch(`${this.apiUrl}/todos`);
            this.todos = await res.json();
            this.render();
        } catch (e) {
            alert("Failed to load todos. Make sure the server is running.");
        }
    }
    
    async add() {
        const text = this.input.value.trim();
        if (!text) return alert("Please enter a task.");
        
        try {
            const res = await fetch(`${this.apiUrl}/todos`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text})
            });
            const todo = await res.json();
            this.todos.unshift(todo);
            this.input.value = "";
            this.render();
        } catch (e) {
            alert("Failed to add todo");
        }
    }

    async del(id) {
        try {
            await fetch(`${this.apiUrl}/todos/${id}`, {method: "DELETE"});
            this.todos = this.todos.filter(t => t.id !== id);
            this.render();
        } catch (e) {
            alert("Failed to delete todo");
        }
    }

    async toggle(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        try {
            await fetch(`${this.apiUrl}/todos/${id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({completed: !todo.completed})
            });
            todo.completed = !todo.completed;
            this.render();
        } catch (e) {
            alert("Failed to update todo");
        }
    }
    
    edit(id) {
        this.editId = id;
        this.render();
        setTimeout(() => document.getElementById(`edit-${id}`)?.focus(), 0);
    }

    async saveEdit(id) {
        const ta = document.getElementById(`edit-${id}`);
        const text = ta?.value.trim();
        if (!text) return;
        
        try {
            await fetch(`${this.apiUrl}/todos/${id}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({text})
            });
            const todo = this.todos.find(t => t.id === id);
            if (todo) todo.text = text;
            this.editId = null;
            this.render();
        } catch (e) {
            alert("Failed to save edit");
        }
    }

    escape(s) {
        const d = document.createElement("div");
        return d.textContent = s, d.innerHTML
    }

    render() {
        const rows = this.todos.map((t, idx) => {
            if (this.editId === t.id) {
                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td class="text-center"></td>
                        <td>
                            <textarea id="edit-${t.id}" class="form-control" rows="2">${this.escape(t.text)}</textarea>
                        </td>
                        <td class="text-center">
                            <div class="btn-group" role="group">
                                <button class="btn btn-sm btn-success" onclick="app.saveEdit(${t.id})">Save</button>
                                <button class="btn btn-sm btn-secondary" onclick="app.editId=null,app.render()">Cancel</button>
                            </div>
                        </td>
                    </tr>`;
            }

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td class="text-center"><input type="checkbox" class="form-check-input" ${t.completed ? "checked" : ""} onclick="app.toggle(${t.id})"></td>
                    <td class="${t.completed ? "text-decoration-line-through text-muted" : ""}">${this.escape(t.text)}</td>
                    <td class="text-center">
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-info" onclick="app.edit(${t.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="app.del(${t.id})">x</button>
                        </div>
                    </td>
                </tr>`;
        }).join("") || `<tr><td colspan="4" class="text-center text-muted">No tasks yet</td></tr>`;

        this.list.innerHTML = rows;
        this.count.textContent = this.todos.length;
    }
}  

let app;
document.addEventListener("DOMContentLoaded", () => app = new TodoApp());
"serviceWorker" in navigator && window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));