import { useState, useRef, useEffect } from 'react'
import chatbotService from '../services/chatbotService'
import '../styles/chatbot.css'

function Chatbot({ userEmotion = null, isOpen = false, onClose = null }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState(userEmotion || 'neutral')
  const messagesEndRef = useRef(null)

  // Load initial message
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const greeting = chatbotService.getGreeting()
      setMessages([{ id: 1, text: greeting, sender: 'bot', timestamp: new Date() }])
    }
  }, [isOpen])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages([...messages, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botResponse = chatbotService.generateResponse(currentEmotion, inputValue)
      const botMessage = {
        id: messages.length + 2,
        text: botResponse.message,
        sender: 'bot',
        type: botResponse.type,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)

      // Close chatbot on goodbye
      if (botResponse.type === 'goodbye' && onClose) {
        setTimeout(() => onClose(), 2000)
      }
    }, 800)
  }

  const quickReplies = [
    "I need help",
    "Give me an affirmation",
    "Coping strategies",
    "I'm doing well",
    "Goodbye"
  ]

  if (!isOpen) return null

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>💭 Emotional Support Bot</h3>
          <p>Your empathetic AI companion</p>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <div className={`message-content ${message.type || ''}`}>
              <div className="message-text">
                {message.text.split('\n').map((line, idx) => (
                  <div key={idx}>
                    {line.includes('**') ? (
                      <>
                        {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                          part.startsWith('**') ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length < 3 && (
        <div className="quick-replies">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              className="quick-reply-btn"
              onClick={() => {
                setInputValue(reply)
                setTimeout(() => {
                  document.querySelector('.chatbot-input')?.focus()
                }, 0)
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chatbot-input-form">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Share your feelings or type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputValue.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Chatbot
