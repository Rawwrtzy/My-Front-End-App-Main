export default function NotificationSystem({ notifications }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map((notif) => (
        <div key={notif.id} className="notification">
          {notif.message}
        </div>
      ))}
    </div>
  );
}