export default function Message({ msg, currentUser }) {
  const isOwn = msg.sender === currentUser;
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`p-2 rounded-lg max-w-xs ${isOwn ? 'bg-blue-500 text-black' : 'bg-gray-300'}`}>
        {msg.type === 'file' ? (
          <a href={`http://localhost:4000${msg.content}`} target="_blank" rel="noreferrer" className="underline">Download File</a>
        ) : (
          <p>{msg.content}</p>
        )}
        <div className="text-xs text-right">
          {msg.seenBy?.length > 1 ? '👀 Read' : '🕐 Sent'}
        </div>
      </div>
    </div>
  );
}
