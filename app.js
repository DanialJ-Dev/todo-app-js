const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addButton = document.getElementById("add-button");
const editButton = document.getElementById("edit-button");
const clearDateButton = document.getElementById("clear-date-button");
const alertMessage = document.getElementById("alert-message");
const deleteAllButton = document.getElementById("delete-all-button");
const filterButtons = document.querySelectorAll(".filter-todos");
const tBody = document.querySelector("tbody");
const notifButton = document.getElementById("toggle-notification");
const notifIcon = notifButton.querySelector("i");
const darkModeButton = document.getElementById("toggle-dark-mode");
const icon = darkModeButton.querySelector("i");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

const generateId = () => {
  return Math.round(Math.random() * Math.random() * Math.pow(10, 15)).toString();
};

const showAlert = (message, type) => {
  alertMessage.innerHTML = "";
  const alert = document.createElement("p");
  alert.innerText = message;
  alert.classList.add("alert", `alert-${type}`);
  alertMessage.append(alert);
  setTimeout(() => alert.style.display = "none", 2000);
};

const displayTodos = (filteredTodos = todos) => {
  if (!filteredTodos.length) {
    tBody.innerHTML = "<tr><td colspan='4'>وظیفه ای پیدا نشد.</td></tr>";
    return;
  }

  tBody.innerHTML = "";
  const today = moment().locale("fa").format("YYYY/MM/DD");

  filteredTodos.sort((a, b) => {
    const dateA = a.date ? moment.from(persianToEnglishNumbers(a.date), "fa", "YYYYMMDD") : null;
    const dateB = b.date ? moment.from(persianToEnglishNumbers(b.date), "fa", "YYYYMMDD") : null;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.toDate() - dateB.toDate();
  });

  filteredTodos.forEach((todo) => {
    const taskDate = persianToEnglishNumbers(todo.date);
    const momentTaskDate = moment(taskDate, "YYYY/MM/DD");
    const momentToday = moment(today, "YYYY/MM/DD");
    const isExpired = momentTaskDate.isBefore(momentToday);
    const isExpiring = [0, 1].includes(momentTaskDate.diff(momentToday, "days"));

    let taskClass = "";
    const isDarkMode = document.body.classList.contains("dark-mode");

    if (todo.completed) taskClass = "completed-task";
    else if (isExpired) taskClass = "expired-task";
    else if (isExpiring) taskClass = "warning-task";

    if (isDarkMode && taskClass) taskClass += " dark-mode";

    const statusText = todo.completed ? "انجام شده" : isExpired ? "وقت اضافه" : "در حال انجام";

    tBody.innerHTML += `
      <tr>
        <td class="${taskClass}">${todo.task}</td>
        <td class="${taskClass}">${todo.date || "-"}</td>
        <td class="${taskClass}">${statusText}</td>
        <td class="${taskClass}">
          <button onclick="editHandler('${todo.id}')">ویرایش</button>
          <button onclick="toggleStatus('${todo.id}')">${todo.completed ? "ناتمام" : "تمام"}</button>
          <button onclick="deleteHandler('${todo.id}')">حذف</button>
        </td>
      </tr>`;
  });
};

const persianToEnglishNumbers = (str) => {
  return str.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
};

const taskHandler = () => {
  const task = taskInput.value;
  const date = dateInput.value;
  const todo = { id: generateId(), task, date, completed: false };

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
  todos = todos.filter((todo) => todo.id !== id);
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
  if(!taskInput.value){
    showAlert("لطفا یک وظیفه وارد کنید.", "error");
    return;
  }
  else{
  todo.task = taskInput.value;
  todo.date = dateInput.value;
  taskInput.value = "";
  dateInput.value = "";
  editButton.style.display = "none";
  addButton.style.display = "inline-block";}
  saveInLocalStorage();
  displayTodos();
  showAlert("وظیفه با موفقیت ویرایش پیدا کرد.", "success");
};

const filterHandler = (event) => {
  const filter = event.target.dataset.filter;
  if (filter === "all") return displayTodos();
  const filteredTodos = todos.filter((todo) => todo.completed === (filter === "completed"));
  displayTodos(filteredTodos);
};

// Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js")
    .then((registration) => console.log("✅ Service Worker ثبت شد:", registration))
    .catch((error) => console.error("❌ ثبت Service Worker ناموفق بود:", error));
}

const sendNotifications = () => {
  if (localStorage.getItem("notificationsEnabled") !== "true") return;
  if (Notification.permission !== "granted") return;

  const tomorrow = moment().add(1, "days").locale("fa").format("YYYY/MM/DD");
  const dueTasks = todos.filter((todo) =>
    persianToEnglishNumbers(todo.date) === persianToEnglishNumbers(tomorrow) &&
    !todo.completed
  );

  dueTasks.forEach((todo) => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("📌 یادآوری وظیفه", {
        body: `📝 ${todo.task}\n 📅 موعد: ${todo.date}`,
        icon: "./icons/icon-192x192.png",
      });
    });
  });
};

// Load
window.addEventListener("load", () => {
  displayTodos();
  sendNotifications();
  updateNotifIcon();
});

addButton.addEventListener("click", taskHandler);
editButton.addEventListener("click", applyEditHandler);
deleteAllButton.addEventListener("click", deleteAll);
filterButtons.forEach((button) => button.addEventListener("click", filterHandler));

// تاریخ
function updateClearDateButton() {
  clearDateButton.style.display = dateInput.value.trim() ? "inline-block" : "none";
}
dateInput.addEventListener("input", updateClearDateButton);
dateInput.addEventListener("change", updateClearDateButton);
clearDateButton.addEventListener("click", () => {
  dateInput.value = "";
  updateClearDateButton();
});
const observer = new MutationObserver(updateClearDateButton);
observer.observe(dateInput, { attributes: true, attributeFilter: ["value"] });
setInterval(updateClearDateButton, 250);
updateClearDateButton();

// دارک مود
const updateIcon = () => {
  icon.className = document.body.classList.contains("dark-mode")
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};
const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  updateIcon();
  displayTodos();
};
const loadTheme = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  updateIcon();
};
darkModeButton.addEventListener("click", toggleDarkMode);
loadTheme();

// نوتیفیکیشن
const updateNotifIcon = () => {
  const enabled = localStorage.getItem("notificationsEnabled") === "true";
  notifIcon.className = enabled ? "fa-solid fa-bell" : "fa-regular fa-bell-slash";
};
const toggleNotifications = () => {
  if (Notification.permission === "default") {
    showAlert("برای دریافت نوتیفیکیشن باید در مرورگر اجازه دهید.", "notif");
    Notification.requestPermission().then((permission) => {
      const granted = permission === "granted";
      localStorage.setItem("notificationsEnabled", granted);
      showAlert(granted ? "نوتیفیکیشن فعال شد." : "اجازه‌ی نوتیفیکیشن رد شد.", granted ? "success" : "error");
      updateNotifIcon();
    });
  } else if (Notification.permission === "granted") {
    const current = localStorage.getItem("notificationsEnabled") === "true";
    localStorage.setItem("notificationsEnabled", !current);
    updateNotifIcon();
    showAlert(!current ? "نوتیفیکیشن‌ها فعال شدند." : "نوتیفیکیشن‌ها غیرفعال شدند.", "success");
  } else {
    showAlert("برای دریافت نوتیفیکیشن باید در مرورگر اجازه دهید.", "notif");
  }
};
notifButton.addEventListener("click", toggleNotifications);

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuOptions = document.getElementById('menuOptions');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const notificationToggle = document.getElementById('notificationToggle');
  

  // نمایش/پنهان کردن منو
  hamburgerBtn.addEventListener('click', () => {
    menuOptions.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal'); // اضافه شده
  
    if (
      !menuOptions.contains(e.target) &&
      !hamburgerBtn.contains(e.target) &&
      (!modal || !modal.contains(e.target)) // بررسی که کلیک داخل modal نباشه
    ) {
      menuOptions.classList.remove('show');
    }
  });

  // دارک مود
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true; // اسلایدر در حالت روشن قرار بگیره
  }
  darkModeToggle.addEventListener('change', () => {
    toggleDarkMode();
  });

  // نوتیفیکیشن
  const notifications = localStorage.getItem("notificationsEnabled");
  if (notifications === "true") {
    notificationToggle.checked = true; // اسلایدر نوتیف روشن باشه
  }
  notificationToggle.addEventListener('change', () => {
    toggleNotifications();
  });
});

document.addEventListener('DOMContentLoaded', () => {
  
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.querySelector('.close');

  const infoBtn = document.getElementById('info');
  const contactBtn = document.getElementById('contact');
  const aboutMenuItem = document.getElementById('open-about');
  const contactMenuItem = document.getElementById('open-contact');

  infoBtn.addEventListener('click', () => {
    modalBody.innerHTML = `
      <h3><i class="fa-solid fa-info-circle"></i> درباره</h3>
      <p>این برنامه یک ابزار ساده برای مدیریت وظایف روزانه است. با آن می‌توانید به راحتی وظیفه‌ای اضافه کنید، وضعیت آن را تغییر دهید، تاریخ مشخص کنید و در صورت نیاز آن را حذف کنید.
<br>
<h3>ویژگی‌ها:</h3>
ایجاد و مدیریت وظایف
<br>
پشتیبانی از حالت تاریک (Dark Mode)
<br>
ارسال نوتیفیکیشن یادآوری
<br>
تنظیمات قابل شخصی‌سازی
<br>
رابط کاربری ساده و کاربردی
</p>
    `;
    modal.style.display = 'block';
  });

  contactBtn.addEventListener('click', () => {
    modalBody.innerHTML = `
      <h3><i class="fa-solid fa-envelope"></i> تماس با ما</h3>
      <p>👨‍💻 طراح و برنامه‌نویس: علیرضا جدید<br>📧 ایمیل: jadid568@gmail.com<br>📞 تلفن: ۰۹۳۶۲۲۹۰۹۳۷</p>
    `;
    modal.style.display = 'block';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  aboutMenuItem.addEventListener('click', () => {
    modalBody.innerHTML = `
      <h3><i class="fa-solid fa-info-circle"></i> درباره</h3>
      <p>این برنامه یک ابزار ساده برای مدیریت وظایف روزانه است. با آن می‌توانید به راحتی وظیفه‌ای اضافه کنید، وضعیت آن را تغییر دهید، تاریخ مشخص کنید و در صورت نیاز آن را حذف کنید.
<br>
<h3>ویژگی‌ها:</h3>
ایجاد و مدیریت وظایف
<br>
پشتیبانی از حالت تاریک (Dark Mode)
<br>
ارسال نوتیفیکیشن یادآوری
<br>
تنظیمات قابل شخصی‌سازی
<br>
رابط کاربری ساده و کاربردی
</p>
    `;
    modal.style.display = 'block';
  });

  contactMenuItem.addEventListener('click', () => {
    modalBody.innerHTML = `
      <h3><i class="fa-solid fa-envelope"></i> تماس با ما</h3>
      <p>👨‍💻 طراح و برنامه‌نویس: علیرضا جدید<br>📧 ایمیل: jadid568@gmail.com<br>📞 تلفن: ۰۹۳۶۲۲۹۰۹۳۷</p>
    `;
    modal.style.display = 'block';
  });
});
