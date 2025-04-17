const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addButton = document.getElementById("add-button");
const editButton = document.getElementById("edit-button");
const clearDateButton = document.getElementById("clear-date-button");
const alertMessage = document.getElementById("alert-message");
const deleteAllButton = document.getElementById("delete-all-button");
const filterButtons = document.querySelectorAll(".filter-todos");
const notificationToggle = document.getElementById("enable-notifications");
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

const requestNotificationPermission = () => {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      localStorage.setItem("notificationsEnabled", "true");
      notificationToggle.checked = true;
      showAlert("دسترسی نوتیفیکیشن فعال شد.", "success");
    } else {
      localStorage.setItem("notificationsEnabled", "false");
      notificationToggle.checked = false;
      showAlert("دسترسی نوتیفیکیشن رد شد.", "error");
    }
  });
};

notificationToggle.addEventListener("change", () => {
  if (Notification.permission === "default") {
    requestNotificationPermission();
  } else if (Notification.permission !== "granted") {
    showAlert(
      "برای دریافت نوتیفیکیشن‌ها باید دسترسی را از مرورگر خود فعال کنید.",
      "error"
    );
    notificationToggle.checked = false;
  } else {
    localStorage.setItem("notificationsEnabled", notificationToggle.checked);
  }
});

const displayTodos = (filteredTodos = todos) => {
  if (!filteredTodos.length) {
    tBody.innerHTML = "<tr><td colspan='4'>وظیفه ای پیدا نشد.</td></tr>";
    return;
  }

  tBody.innerHTML = "";
  const today = moment().locale("fa").format("YYYY/MM/DD");

  filteredTodos.sort((a, b) => {
    const dateA = a.date
      ? moment(persianToEnglishNumbers(a.date), "YYYY/MM/DD")
      : null;
    const dateB = b.date
      ? moment(persianToEnglishNumbers(b.date), "YYYY/MM/DD")
      : null;

    if (!dateA) return 1; // اگر `dateA` خالی باشد، آن را به انتهای لیست ببرد
    if (!dateB) return -1; // اگر `dateB` خالی باشد، `dateA` قبل از `dateB` قرار بگیرد

    return dateA - dateB; // مرتب‌سازی بر اساس تاریخ
  });

  filteredTodos.forEach((todo) => {
    const taskDate = persianToEnglishNumbers(todo.date);
    const momentTaskDate = moment(taskDate, "YYYY/MM/DD");
    const momentToday = moment(today, "YYYY/MM/DD");
    const isExpired = momentTaskDate.isBefore(momentToday);
    const isExpiring =
      momentTaskDate.diff(momentToday, "days") === 1 ||
      momentTaskDate.diff(momentToday, "days") === 0;

    let taskClass = "";
    if (todo.completed) {
      taskClass = "completed-task"; // رنگ سبز برای انجام شده‌ها
    } else if (isExpired) {
      taskClass = "expired-task"; // رنگ قرمز برای وظایف منقضی شده
    } else if (isExpiring) {
      taskClass = "warning-task"; // رنگ زرد برای وظایفی که فردا موعدشان است
    }

    let statusText = "";
    if (todo.completed) {
      statusText = "انجام شده";
    } else if (isExpired) {
      statusText = "وقت اضافه";
    } else {
      statusText = "در حال انجام";
    }

    tBody.innerHTML += `<tr>
  <td class="${taskClass}">
  ${todo.task}
  </td>
  <td class="${taskClass}">
  ${todo.date || "-"}
  </td>
  <td class="${taskClass}">
  ${statusText}
  </td>
  <td class="${taskClass}">
  <button onclick="editHandler('${todo.id}')">ویرایش</button>
  <button onclick="toggleStatus('${todo.id}')">${
      todo.completed ? "ناتمام" : "تمام"
    }</button>
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

// if (dateInput.value) {
//   clearDateButton.style.display = "inline-block";
//   const clearDateHandler = () => {
//     dateInput.value = "";
//     clearDateButton.style.display = "none";
//   };
//   clearDateButton.addEventListener("click", clearDateHandler);
// }

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

// ثبت Service Worker برای مدیریت نوتیفیکیشن در پس‌زمینه
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((registration) => {
      console.log("✅ Service Worker ثبت شد:", registration);
    })
    .catch((error) => {
      console.error("❌ ثبت Service Worker ناموفق بود:", error);
    });
}

// درخواست دسترسی نوتیفیکیشن هنگام بارگذاری صفحه
// window.addEventListener("load", () => {
//   if (Notification.permission === "default") {
//     Notification.requestPermission().then((permission) => {
//       if (permission === "granted") {
//         console.log("✅ دسترسی نوتیفیکیشن فعال شد.");
//       } else {
//         console.warn("⚠️ دسترسی نوتیفیکیشن رد شد.");
//       }
//     });
//   }

//   // ارسال نوتیفیکیشن‌های وظایف موعددار
//   sendNotifications();
// });

// ارسال نوتیفیکیشن وظایف موعددار
const sendNotifications = () => {
  if (localStorage.getItem("notificationsEnabled") !== "true") {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const tomorrow = moment().add(1, "days").locale("fa").format("YYYY/MM/DD");
  const dueTasks = todos.filter(
    (todo) =>
      persianToEnglishNumbers(todo.date) === persianToEnglishNumbers(tomorrow)
  );

  if (dueTasks.length === 0) {
    return;
  }

  dueTasks.forEach((todo) => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("📌 یادآوری وظیفه", {
        body: `📝 ${todo.task}\n 📅 موعد: ${todo.date}`,
        icon: "./icons/icon-192x192.png",
      });
    });
  });
};

window.addEventListener("load", (e) => displayTodos());
addButton.addEventListener("click", taskHandler);
editButton.addEventListener("click", applyEditHandler);

deleteAllButton.addEventListener("click", deleteAll);
filterButtons.forEach((button) => {
  button.addEventListener("click", filterHandler);
});
// هنگام بارگذاری صفحه، وضعیت نوتیفیکیشن‌ها را از localStorage بارگذاری می‌کنیم
window.addEventListener("load", () => {
  const isEnabled = localStorage.getItem("notificationsEnabled") === "true";
  // وضعیت چک‌باکس را بر اساس localStorage تنظیم می‌کنیم
  notificationToggle.checked = isEnabled;

  // بررسی دسترسی نوتیفیکیشن‌ها
  if (Notification.permission !== "granted") {
    notificationToggle.checked = false; // اگر دسترسی رد شده باشد، تیک برداشته می‌شود
  }
});

notificationToggle.addEventListener("change", () => {
  if (Notification.permission !== "granted") {
    showAlert(
      "برای دریافت نوتیفیکیشن‌ها دسترسی را از مرورگر خود فعال کنید.",
      "notif"
    );
    notificationToggle.checked = false; // غیرفعال کردن چک‌باکس
    return; // جلوگیری از ذخیره‌سازی در صورت عدم دسترسی
  }

  // اگر دسترسی به نوتیفیکیشن‌ها فعال باشد، وضعیت چک‌باکس را ذخیره می‌کنیم
  localStorage.setItem("notificationsEnabled", notificationToggle.checked);
});

function updateClearDateButton() {
  const value = dateInput.value.trim();
  clearDateButton.style.display = value ? "inline-block" : "none";
}

// وقتی کاربر دستی چیزی وارد یا پاک کنه
dateInput.addEventListener("input", updateClearDateButton);
dateInput.addEventListener("change", updateClearDateButton);

// دکمه "حذف تاریخ"
clearDateButton.addEventListener("click", () => {
  dateInput.value = "";
  updateClearDateButton();
});

// چون persian-datepicker مقدار رو با JS تغییر می‌ده، باید با observer گوش بدیم
const observer = new MutationObserver(updateClearDateButton);
observer.observe(dateInput, { attributes: true, attributeFilter: ['value'] });

// یا اگر جواب نداد (بسته به تقویم)، هر نیم‌ثانیه چک کن:
setInterval(updateClearDateButton, 250);

// بار اول هم چک کن
updateClearDateButton();


