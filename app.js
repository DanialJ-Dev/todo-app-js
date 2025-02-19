const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addButton = document.getElementById("add-button");
const editButton = document.getElementById("edit-button");
const alertMessage = document.getElementById("alert-message");
const deleteAllButton = document.getElementById("delete-all-button");
const filterButtons = document.querySelectorAll(".filter-todos");
const tBody = document.querySelector("tbody");
let todos = JSON.parse(localStorage.getItem("todos")) || [];

const generateId = () => {
  const id = Math.round(
    Math.random() * Math.random() * Math.pow(10, 15)
  ).toString();
  return id;
};

const showAlert = (message, type) => {
  alertMessage.innerHTML = "";
  const alert = document.createElement("p");
  alert.innerText = message;
  alert.classList.add("alert");
  alert.classList.add(`alert-${type}`);
  alertMessage.append(alert);

  setTimeout(() => {
    alert.style.display = "none";
  }, 2000);
};

const displayTodos = (filteredTodos = todos) => {
  if (!filteredTodos.length) {
    tBody.innerHTML = "<tr><td colspan='4'>وظیفه ای پیدا نشد.</td></tr>";
    return;
  }

  tBody.innerHTML = "";
  filteredTodos.forEach((todo) => {
    tBody.innerHTML += `<tr>
  <td class="${todo.completed ? "completed-task" : ""}">
  ${todo.task}
  </td>
  <td class="${todo.completed ? "completed-task" : ""}">
  ${todo.date || "-"}
  </td>
  <td class="${todo.completed ? "completed-task" : ""}">
  ${todo.completed ? "انجام شده" : "در حال انجام"}
  </td>
  <td class="${todo.completed ? "completed-task" : ""}">
  <button onclick="editHandler('${todo.id}')">ویرایش</button>
  <button onclick="toggleStatus('${todo.id}')">${
      todo.completed ? "ناتمام" : "تمام"
    }</button>
  <button onclick="deleteHandler('${todo.id}')">حذف</button>
  </td>
  </tr>`;
  });
};

const taskHandler = () => {
  const task = taskInput.value;
  const date = dateInput.value;
  const todo = {
    id: generateId(),
    task: task,
    date: date,
    completed: false,
  };
  if (task) {
    todos.push(todo);
    displayTodos();
    saveInLocalStorage();
    taskInput.value = "";
    dateInput.value = "";
    showAlert("وظیفه با موفقیت اضافه شد.", "success");
  } else {
    showAlert("لطفا یک وظیفه وارد کنید.", "error");
  }
};

const saveInLocalStorage = () => {
  localStorage.setItem("todos", JSON.stringify(todos));
};

const resetEditMode = () => {
  if (editButton.style.display === "inline-block") {
    taskInput.value = "";
    dateInput.value = "";
    editButton.style.display = "none";
    addButton.style.display = "inline-block";
  }
};

const deleteAll = () => {
  if (todos.length) {
    todos = [];
    saveInLocalStorage();
    displayTodos();
    showAlert("همه وظایف با موفقیت حذف شدند.", "success");
  } else {
    showAlert("چیزی برای حذف وجود ندارد.", "error");
  }
  resetEditMode();
};

const deleteHandler = (id) => {
  const newTodos = todos.filter((todo) => todo.id !== id);
  todos = newTodos;
  saveInLocalStorage();
  displayTodos();
  showAlert("وظیفه با موفقیت حذف شد.", "success");
  resetEditMode();
};

const toggleStatus = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  todo.completed = !todo.completed;
  saveInLocalStorage();
  displayTodos();
  showAlert("وضعیت با موفقیت تغییر پیدا کرد.", "success");
};

const editHandler = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  taskInput.value = todo.task;
  dateInput.value = todo.date;
  addButton.style.display = "none";
  editButton.style.display = "inline-block";
  editButton.dataset.id = id;
};

const applyEditHandler = (event) => {
  const id = event.target.dataset.id;
  const todo = todos.find((todo) => todo.id === id);
  todo.task = taskInput.value;
  todo.date = dateInput.value;
  taskInput.value = "";
  dateInput.value = "";
  editButton.style.display = "none";
  addButton.style.display = "inline-block";
  saveInLocalStorage();
  displayTodos();
  showAlert("وظیفه با موفقیت ویرایش پیدا کرد.", "success");
};

const filterHandler = (event) => {
  let filteredTodos = null;
  const filter = event.target.dataset.filter;
  if (filter === "all") {
    displayTodos();
  } else if (filter === "pending") {
    filteredTodos = todos.filter((todo) => todo.completed === false);
    displayTodos(filteredTodos);
  } else if (filter === "completed") {
    filteredTodos = todos.filter((todo) => todo.completed === true);
    displayTodos(filteredTodos);
  }
};

window.addEventListener("load", (e) => displayTodos());
addButton.addEventListener("click", taskHandler);
editButton.addEventListener("click", applyEditHandler);
deleteAllButton.addEventListener("click", deleteAll);
filterButtons.forEach((button) => {
  button.addEventListener("click", filterHandler);
});
