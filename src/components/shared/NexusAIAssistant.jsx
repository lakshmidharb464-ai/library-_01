import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import styles from './NexusAIAssistant.module.css';

/**
 * NexusAIAssistant - A high-fidelity holographic AI companion.
 */
export default function NexusAIAssistant() {
  const { currentUser, currentRole, apiFetch } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting();
      addMessage(greeting, 'ai');
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getGreeting = () => {
    if (!currentUser) return "Salutations, traveler. I am AEGIS. How may I assist your traversal of the archive today?";
    if (currentRole === 'faculty') return `Strategic greetings, Professor ${currentUser.name.split(' ')[1]}. AEGIS is ready to analyze archive metrics for your department.`;
    return `Identity verified: ${currentUser.name}. Connection stable. How can AEGIS assist your research protocols?`;
  };

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    addMessage(userText, 'user');

    // Call backend AI API
    setIsTyping(true);
    try {
      const response = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userText }),
      });
      
      setIsTyping(false);
      addMessage(response.data.text, 'ai');
    } catch (err) {
      setIsTyping(false);
      addMessage("Connection to AEGIS core interrupted. Please retry link.", 'ai');
    }
  };

  return (
    <div className={`${styles.assistantWrapper} ${isOpen ? styles.opened : ''}`}>
      {/* Floating Orb / Trigger */}
      <button 
        className={styles.trigger} 
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Minimize AEGIS" : "Initiate AEGIS Link"}
      >
        <div className={styles.orbInner}>
          <div className={styles.core} />
          <div className={styles.rings}>
            <div className={styles.ring1} />
            <div className={styles.ring2} />
          </div>
        </div>
        {!isOpen && (
          <div className={styles.pulseLabel}>// AEGIS_LINK</div>
        )}
      </button>

      {/* Chat Window */}
      <div className={`${styles.chatWindow} glass-card`}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.tag}>// NEXUS_AI</span>
            <h3>AEGIS CORE</h3>
          </div>
          <div className={styles.headerStatus}>
            <div className={styles.statusDot} />
            <span>ACTIVE_SYNC</span>
          </div>
        </header>

        <div className={styles.messageArea} ref={scrollRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${styles[msg.sender]}`}>
              <div className={styles.msgText}>{msg.text}</div>
              <div className={styles.msgTime}>{msg.timestamp}</div>
            </div>
          ))}
          {isTyping && (
            <div className={`${styles.message} ${styles.ai}`}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Input directive..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
