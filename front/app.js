const API_URL = "http://localhost:3000";
let userId = localStorage.getItem("userId");

// Register User
async function register() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    let data = await res.json();
    alert(data.message || data.error);
}

//Login User
async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }
    let res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    let data = await res.json();
    if (data.userId) {
        userId = data.userId;
        localStorage.setItem("userId", userId);
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("todoContainer").style.display = "block";
        loadTasks();
    } else {
        alert(data.error);
    }
}

//Load Tasks
async function loadTasks() {
    let res = await fetch(`${API_URL}/tasks?userId=${userId}`);
    let tasks = await res.json();

    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach(task => {
        let li = document.createElement("li");
        li.innerHTML = `${task.task} <button onclick="deleteTask(${task.id})">Remove</button>`;
        taskList.appendChild(li);
    });
}

//Add Task
async function addTask() {
    let task = document.getElementById("taskInput").value;
    if (!task.trim()) return alert("Enter a task!");

    await fetch(`${API_URL}/add-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, task }),
    });

    document.getElementById("taskInput").value = "";
    loadTasks();
}

//Delete Task
async function deleteTask(id) {
    await fetch(`${API_URL}/delete-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId }),
    });

    loadTasks();
}

//Logout
function logout() {
    localStorage.removeItem("userId");
    userId = null;
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("todoContainer").style.display = "none";
}

window.onload = () => {
    if (userId) {
        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("todoContainer").style.display = "block";
        loadTasks();
    }
};
