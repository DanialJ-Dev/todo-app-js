self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const targetUrl = "https://danialj-dev.github.io/todo-app-js/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
