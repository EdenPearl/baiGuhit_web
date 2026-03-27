import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../ChatRoom.css";

const SOCKET_SERVER_URL = "https://ebaybaymo-server-b084d082cda7.herokuapp.com";
const API_BASE_URL = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/chat";
const url_t = "https://ebaybaymo-server-b084d082cda7.herokuapp.com/";

const Chatroom = () => {
  const [roomName, setRoomName] = useState("general");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [, setIsLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          toast.error("No session found. Please log in.");
          return;
        }

        const response = await fetch(url_t + "auth/user_profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "session-id": sessionId,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.user) {
            setUsername(result.user.username || "User");
            setUserId(result.user.id);
            localStorage.setItem("userId", result.user.id.toString());
          }
        } else {
          console.error("Failed to fetch user data", response.status);
          toast.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(parseInt(storedUserId));
  }, []);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("join_room", roomName);
    const personalRoom = `user_${userId}`;
    socketRef.current.emit("join_room", personalRoom);

    socketRef.current.on("new_message", (msg) => {
      if (msg.room_name === roomName) setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socketRef.current.on("new_notification_reply", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socketRef.current.on("reconnect", () => {
      socketRef.current.emit("join_room", roomName);
      socketRef.current.emit("join_room", `user_${userId}`);
      console.log("Rejoined rooms after reconnect");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomName, userId]);

  useEffect(() => {
    if (!roomName) return;
    setIsLoading(true);
    axios
      .get(`${API_BASE_URL}/messages/${roomName}`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages.");
      })
      .finally(() => setIsLoading(false));
  }, [roomName]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        toast.error("Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !username || !roomName || !userId) {
      toast.error("Please enter a valid message.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        room_name: roomName,
        user_id: userId,
        username,
        message,
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (id, msgUserId) => {
    if (userId !== msgUserId) {
      toast.error("You can only delete your own messages.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/messages/${id}`, { data: { user_id: userId } });
      setMessages((prev) => prev.filter((msg) => msg.message_id !== id));
      toast.success("Message deleted successfully!");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (notification) => {
    if (!replyMessage.trim() || !userId || !notification.user_id || !notification.room_name) {
      toast.error("Please enter a valid reply message.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/notifications/reply`, {
        room_name: notification.room_name,
        user_id: userId,
        target_user_id: notification.user_id,
        message: replyMessage,
      });
      setReplyMessage("");
      setReplyingTo(null);
      toast.success("Reply sent successfully!");
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast.error("Failed to send reply.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyClick = (notification) => {
    setReplyingTo(notification.id === replyingTo ? null : notification.id);
    setReplyMessage("");
  };

  return (
    <div className="chat-container">
      <ToastContainer />
      <div className="left-panel">
        <h3>Notifications</h3>
        <div className="notification-box">
          {notifications.length === 0 ? (
            <p className="no-content">No notifications</p>
          ) : (
            notifications.map((note) => (
              <div
                key={note.id}
                className={`notification-bubble ${note.type === "reply" ? "reply-notification" : ""}`}
              >
                <strong>{note.room_name}</strong>: {note.message}
                <br />
                <small>{new Date(note.created_at).toLocaleString()}</small>
                {note.user_id !== userId && note.type !== "reply" && (
                  <div>
                    <button
                      onClick={() => handleReplyClick(note)}
                      className="reply-btn"
                    >
                      {replyingTo === note.id ? "Cancel" : "Reply"}
                    </button>
                  </div>
                )}
                {replyingTo === note.id && (
                  <div className="reply-input-container">
                    <input
                      placeholder="Type your reply"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply(note)}
                    />
                    <button
                      onClick={() => handleSendReply(note)}
                      disabled={!replyMessage.trim()}
                    >
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="right-panel">
        <div className="chat-header">
          <div>
            <label>Join Room</label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="room-input"
            />
          </div>
          <div>
            <label>Username</label>
            <input
              value={username}
              readOnly
              placeholder="Your username"
              className="username-input"
            />
          </div>
        </div>

        <div className="chat-box">
          {messages.length === 0 ? (
            <p className="no-content">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.message_id}
                className={`message-bubble ${msg.user_id === userId ? "sent" : "received"}`}
              >
                <strong>{msg.username}</strong>: {msg.message}
                <br />
                <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
                {msg.user_id === userId && (
                  <button
                    onClick={() => handleDeleteMessage(msg.message_id, msg.user_id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="chat-footer">
          <input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <div className="send-button-container">
            <button onClick={handleSendMessage} disabled={!message.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;