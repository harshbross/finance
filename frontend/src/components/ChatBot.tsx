'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { formatPrice, handleImageError } from '../utils/format';
import styles from './ChatBot.module.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  productSuggestions?: Array<{
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  }>;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-init-1',
    sender: 'bot',
    text: "Hi there! 👋 I'm your Aether AI shopping assistant. Looking for something specific like a modern Table, Sofa, or Badminton gear? Ask me anything!",
    time: 'Just now',
  },
];

const QUICK_CHIPS = [
  '🪑 Show Tables & Sofas',
  '🏸 Badminton Gear',
  '💻 High-End Laptops',
  '📦 Track My Order',
  '⚡ Active Coupons',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, messages, isTyping]);

  const generateBotReply = (userQuery: string): { text: string; products?: any[] } => {
    const q = userQuery.toLowerCase().trim();

    // Table search
    if (q.includes('table') || q.includes('desk')) {
      const table = MOCK_PRODUCTS.find((p) => p.id === 9) || MOCK_PRODUCTS[0];
      const chair = MOCK_PRODUCTS.find((p) => p.id === 12);
      const suggestions = [table];
      if (chair) suggestions.push(chair);
      return {
        text: `Here is our top-selling study and work table! Crafted from solid European white oak with built-in cable conduits and steel hairpin legs for ₹16,999:`,
        products: suggestions,
      };
    }

    // Sofa search
    if (q.includes('sofa') || q.includes('couch') || q.includes('furniture')) {
      const sofa = MOCK_PRODUCTS.find((p) => p.id === 10);
      const table = MOCK_PRODUCTS.find((p) => p.id === 9);
      const suggestions = [];
      if (sofa) suggestions.push(sofa);
      if (table) suggestions.push(table);
      return {
        text: `Check out our Scandinavian Luxury 3-Seater Velvet Sofa in emerald green (₹38,499), paired with matching oak furniture:`,
        products: suggestions,
      };
    }

    // Badminton search
    if (
      q.includes('badminton') ||
      q.includes('racket') ||
      q.includes('racquet') ||
      q.includes('shuttle') ||
      q.includes('sports')
    ) {
      const racket = MOCK_PRODUCTS.find((p) => p.id === 11);
      const shuttle = MOCK_PRODUCTS.find((p) => p.id === 13);
      const suggestions = [];
      if (racket) suggestions.push(racket);
      if (shuttle) suggestions.push(shuttle);
      return {
        text: `We have the tournament-grade Voltric Pro Carbon Fiber Badminton Racket (₹3,899) and Aerospeed Pro Feather Shuttlecocks (₹1,299) in stock:`,
        products: suggestions,
      };
    }

    // Laptops & Computers
    if (q.includes('laptop') || q.includes('computer') || q.includes('mac') || q.includes('pc')) {
      const laptop = MOCK_PRODUCTS.find((p) => p.id === 1) || MOCK_PRODUCTS[0];
      return {
        text: `Take a look at the flagship Aether Core Laptop Pro with 12-core silicon and 32GB LPDDR5X RAM:`,
        products: [laptop],
      };
    }

    // Headphones & Audio
    if (q.includes('headphone') || q.includes('audio') || q.includes('sound') || q.includes('music')) {
      const audio = MOCK_PRODUCTS.find((p) => p.id === 4);
      return {
        text: `Our Cyberpunk ANC Studio Headphones (₹24,999) feature -45dB hybrid active noise cancellation:`,
        products: audio ? [audio] : [],
      };
    }

    // Order Tracking
    if (q.includes('track') || q.includes('order') || q.includes('status') || q.includes('shipment')) {
      return {
        text: `📦 You can track your recent orders and shipment manifests on the Orders page: /orders. All orders include live tracking and dispatch updates via email!`,
      };
    }

    // Shipping & Delivery
    if (q.includes('ship') || q.includes('deliver') || q.includes('free shipping')) {
      return {
        text: `⚡ We offer Free Express Shipping across all of India on every order! Standard delivery takes 3 to 5 business days with door-to-door tracking.`,
      };
    }

    // Payment methods
    if (q.includes('pay') || q.includes('card') || q.includes('upi') || q.includes('cod')) {
      return {
        text: `💳 We accept all major payment methods: UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, and Net Banking through our secure 256-bit encrypted gateway.`,
      };
    }

    // Discount / Coupons
    if (q.includes('coupon') || q.includes('discount') || q.includes('code') || q.includes('deal') || q.includes('offer')) {
      return {
        text: `🎉 Exclusive Deal: Apply promo code **AETHER10** at checkout for an instant 10% discount on your entire cart!`,
      };
    }

    // Return policy
    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return {
        text: `🔄 We provide a 30-day hassle-free return and replacement policy. If you are not satisfied with your item, contact us for an instant pickup and refund!`,
      };
    }

    // General dynamic product search in catalog
    const matches = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matches.length > 0) {
      return {
        text: `Here are the matching products from our catalog in Indian Rupees (INR):`,
        products: matches,
      };
    }

    return {
      text: `I'm here to help! You can ask me about our furniture (Table, Sofa), badminton gear, laptops, tracking orders, or active promo codes. What can I find for you?`,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const replyData = generateBotReply(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyData.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productSuggestions: replyData.products,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 600);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className={styles.chatbotWrapper}>
      {/* Floating Trigger Button */}
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        title="Chat with Aether AI Assistant"
      >
        {!isOpen && <div className={styles.pulseRing} />}
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
        {!isOpen && unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.botInfo}>
              <div className={styles.avatar}>
                <Bot size={20} />
                <span className={styles.onlineDot} />
              </div>
              <div>
                <div className={styles.botTitle}>Aether Assistant</div>
                <div className={styles.botStatus}>Online • Powered by AI</div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.headerBtn}
                onClick={handleResetChat}
                title="Restart conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className={styles.headerBtn}
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.sender === 'bot' ? styles.botRow : styles.userRow
                }`}
              >
                <div
                  className={`${styles.messageBubble} ${
                    msg.sender === 'bot' ? styles.botBubble : styles.userBubble
                  }`}
                >
                  {msg.text}

                  {/* Product Recommendations */}
                  {msg.productSuggestions && msg.productSuggestions.length > 0 && (
                    <div className={styles.productCardsGrid}>
                      {msg.productSuggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className={styles.productCardMini}
                          onClick={() => setIsOpen(false)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={styles.productImg}
                            onError={handleImageError}
                          />
                          <div className={styles.productInfo}>
                            <div className={styles.productName}>{product.name}</div>
                            <div className={styles.productPrice}>{formatPrice(product.price)}</div>
                          </div>
                          <ExternalLink size={14} color="var(--text-muted)" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className={`${styles.messageRow} ${styles.botRow}`}>
                <div className={styles.typingBubble}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className={styles.quickChips}>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.chipBtn}
                onClick={() => handleSendMessage(chip.replace(/[^\w\s&]/g, '').trim())}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className={styles.inputForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className={styles.inputField}
              placeholder="Ask about products, orders..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!inputValue.trim()}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
