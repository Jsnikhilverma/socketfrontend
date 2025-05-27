import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Apka backend server address

function GroupChat() {
  const [room, setRoom] = useState(""); // Room name input by user
  const [currentRoom, setCurrentRoom] = useState(""); // Jo room me join hai
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [user, setUser] = useState("User_" + Math.floor(Math.random() * 1000));

  useEffect(() => {
    if (!currentRoom) return; // Jab tak room join nahi, listen nahi karenge

    // Join karte hi server ko batado
    socket.emit("joinRoom", currentRoom);

    // Naye message milne par chat me add karo
    socket.on("receiveMessage", ({ message, user }) => {
      setChatMessages((prev) => [...prev, { message, user }]);
    });

    // Cleanup event listener jab room change ho ya component unmount ho
    return () => {
      socket.off("receiveMessage");
    };
  }, [currentRoom]);

  const joinRoom = () => {
    if (room.trim() === "") return alert("Please enter a room name");

    // Clear pehle ke messages jab room change ho
    setChatMessages([]);
    setCurrentRoom(room);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;

    // Apne messages ko locally add karo
    setChatMessages((prev) => [...prev, { message, user: "You" }]);

    // Server ko bhejo
    socket.emit("sendMessage", { room: currentRoom, message, user });

    setMessage("");
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      {/* Room join/input section */}
      {!currentRoom ? (
        <div>
          <h3>Join a Chat Room</h3>
          <input
            type="text"
            placeholder="Enter room name or friend ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom} style={{ marginLeft: 8 }}>
            Join Room
          </button>
        </div>
      ) : (
        <div>
          <h3>Group Chat - Room: {currentRoom}</h3>

          <div
            style={{
              height: 300,
              border: "1px solid #ccc",
              padding: 10,
              overflowY: "scroll",
              marginBottom: 10,
            }}
          >
            {chatMessages.map((msg, idx) => (
              <div key={idx}>
                <b>{msg.user}: </b> {msg.message}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} style={{ marginLeft: 8 }}>
            Send
          </button>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                setCurrentRoom("");
                setChatMessages([]);
                setRoom("");
              }}
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChat;
