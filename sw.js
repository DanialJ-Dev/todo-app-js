self.addEventListener("notificationclick", function(event) {
    event.notification.close();
    clients.openWindow("/"); // باز کردن صفحه اپلیکیشن در کلیک روی نوتیفیکیشن
  });
  