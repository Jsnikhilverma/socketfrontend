import { useState } from "react";
import ChatBox from "./components/ChatBox";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("group-room");
  const [joined, setJoined] = useState(false);

  const joinChat = () => {
    if (username.trim()) setJoined(true);
  };

  return (
    <div className="p-4">
      {!joined ? (
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Join Chat</h1>
          <input
            className="border p-2 w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={joinChat}>
            Join
          </button>
        </div>
      ) : (
        <ChatBox username={username} room={room} />
      )}
    </div>
  );
}

export default App;
