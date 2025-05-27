import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// connect to socket.io backend
const socket = io("http://localhost:4000");

const GroupChat = () => {
  const [user, setUser] = useState("User_" + Math.floor(Math.random() * 1000));
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!currentRoom) return;

    socket.emit("joinRoom", currentRoom);

    // fetch chat history
    fetch(`http://localhost:4000/api/chat/room/${currentRoom}/messages`)
      .then(res => res.json())
      .then(data => setChatMessages(data));

    socket.on("receiveMessage", ({ message, user }) => {
      setChatMessages(prev => [...prev, { message, user }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentRoom]);

  const generateRoomCode = async () => {
    const code = "room_" + Math.floor(1000 + Math.random() * 9000);
    try {
      const res = await fetch("http://localhost:4000/api/chat/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.ok) {
        setRoomCode(code);
        setIsCreator(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Room create error:", err);
    }
  };

  const joinRoom = () => {
    if (!roomCode.trim()) {
      alert("Please enter a room code.");
      return;
    }
    setCurrentRoom(roomCode);
    setChatMessages([]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { room: currentRoom, message, user });
    setChatMessages(prev => [...prev, { message, user: "You" }]);
    setMessage("");
  };

  const leaveRoom = () => {
    setCurrentRoom("");
    setRoomCode("");
    setChatMessages([]);
    setIsCreator(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      {!currentRoom ? (
        <div>
          <h2>🔐 Create or Join a Chat Room</h2>

          {/* Create Room Section */}
          <button onClick={generateRoomCode} style={{ marginBottom: 10 }}>
            ➕ Create Room
          </button>

          {isCreator && (
            <div>
              <p>✅ Room created! Share this code:</p>
              <code style={{ backgroundColor: "#eee", padding: "5px 10px" }}>
                {roomCode}
              </code>
            </div>
          )}

          {/* Join Room */}
          <div style={{ marginTop: 20 }}>
            <input
              type="text"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              style={{ padding: 8, width: "70%" }}
            />
            <button onClick={joinRoom} style={{ marginLeft: 10 }}>
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3>🟢 Room: <code>{currentRoom}</code></h3>

          {/* Chat Box */}
          <div
            style={{
              height: 300,
              overflowY: "scroll",
              border: "1px solid #ccc",
              padding: 10,
              backgroundColor: "black",
              marginBottom: 10,
            }}
          >
            {chatMessages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.user}:</strong> {msg.message}
              </div>
            ))}
          </div>

          {/* Input */}
          <div>
            <input
              type="text"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ padding: 8, width: "70%" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: 10 }}>
              Send
            </button>
          </div>

          <button onClick={leaveRoom} style={{ marginTop: 20 }}>
            🚪 Leave Room
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
