import { useState, useRef, useEffect } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './NexusCommLink.module.css';

export default function NexusCommLink() {
  const { messages, users, currentUser, dispatch } = useLibrary();
  const [activeContactId, setActiveContactId] = useState(null);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContactId]);

  // Get users other than currentUser
  const contacts = (users || []).filter(u => u.id !== currentUser?.id);
  
  // Set default active contact if none
  useEffect(() => {
    if (!activeContactId && contacts.length > 0) {
      setActiveContactId(contacts[0].id);
    }
  }, [activeContactId, contacts]);

  const activeContact = contacts.find(u => u.id === activeContactId);

  // Filter messages for active thread
  const thread = (messages || []).filter(m => 
    (m.senderId === currentUser?.id && m.receiverId === activeContactId) ||
    (m.senderId === activeContactId && m.receiverId === currentUser?.id)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        id: `msg${Date.now()}`,
        senderId: currentUser.id,
        receiverId: activeContactId,
        content: inputText,
        timestamp: new Date().toISOString()
      }
    });
    setInputText('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Nexus Comm-Link</h2>
        <span className="badge badge-success">Encrypted</span>
      </div>

      <div className={styles.chatApp}>
        {/* Contacts Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.searchBox}>
            <input type="text" placeholder="Search directory..." />
          </div>
          <div className={styles.contactList}>
            {contacts.map(contact => {
              const lastMsg = (messages || [])
                .filter(m => (m.senderId === currentUser?.id && m.receiverId === contact.id) || (m.senderId === contact.id && m.receiverId === currentUser?.id))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

              return (
                <button 
                  key={contact.id} 
                  className={`${styles.contactCard} ${activeContactId === contact.id ? styles.contactActive : ''}`}
                  onClick={() => setActiveContactId(contact.id)}
                >
                  <div className={styles.avatar}>{contact.name?.charAt(0) || '?'}</div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactName}>{contact.name}</div>
                    <div className={styles.contactRole}>{contact.role}</div>
                  </div>
                  {lastMsg && <div className={styles.dot}>•</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {activeContact ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.avatar}>{activeContact.name?.charAt(0) || '?'}</div>
                <div>
                  <h3 className={styles.chatName}>{activeContact.name}</h3>
                  <div className={styles.chatRole}>{activeContact.department} • {activeContact.role}</div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {thread.length === 0 ? (
                  <div className={styles.noMessages}>
                    Secure connection established.<br/>Send a message to begin the transmission.
                  </div>
                ) : (
                  thread.map(msg => {
                    const isMine = msg.senderId === currentUser?.id;
                    const msgTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`${styles.messageWrapper} ${isMine ? styles.msgMineWrapper : ''}`}>
                        <div className={`${styles.messageBubble} ${isMine ? styles.msgMine : styles.msgTheirs}`}>
                          {msg.content}
                        </div>
                        <div className={styles.msgTime}>{msgTime}</div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form className={styles.inputArea} onSubmit={handleSend}>
                <input 
                  type="text" 
                  autoFocus
                  placeholder={`Message ${activeContact.name}...`} 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                />
                <button type="submit" disabled={!inputText.trim()}>Send</button>
              </form>
            </>
          ) : (
            <div className={styles.selectPrompt}>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>📡</div>
              Select a connection to initiate Comm-Link
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
