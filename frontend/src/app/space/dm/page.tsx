"use client";

import { useAuth } from "@/contexts/AuthContext";
import * as dmApi from "@/lib/dm-api";
import type { Conversation, DirectMessage, UserSearchResult } from "@/types/dm";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./dm.module.css";

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function DMPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const list = await dmApi.listConversations(token);
      setConversations(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(async (convId: string) => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const msgs = await dmApi.getMessages(token, convId);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages.");
    } finally {
      setMessagesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      pollIntervalRef.current = setInterval(() => {
        loadMessages(selectedConv.id);
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [selectedConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = useCallback(async (query: string) => {
    if (!token) return;
    setSearching(true);
    try {
      const results = await dmApi.searchUsers(token, query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [token]);

  useEffect(() => {
    if (showNewChat) {
      const timeout = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, showNewChat, handleSearch]);

  const [startingChat, setStartingChat] = useState(false);

  const handleStartConversation = async (recipientId: string) => {
    if (!token || startingChat) return;
    setStartingChat(true);
    setError(null);
    try {
      const conv = await dmApi.startConversation(token, recipientId);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
      await loadConversations();
      setSelectedConv(conv);
    } catch (e) {
      console.error("Failed to start conversation:", e);
      setError(e instanceof Error ? e.message : "Failed to start conversation.");
    } finally {
      setStartingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedConv || !messageInput.trim()) return;

    setSending(true);
    try {
      const newMsg = await dmApi.sendMessage(token, selectedConv.id, messageInput.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput("");
      loadConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.userId !== user?.userId) ?? conv.participants[0];
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
          <button
            type="button"
            className={styles.newChatButton}
            onClick={() => setShowNewChat(true)}
            aria-label="New message"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No messages yet</p>
            <button type="button" className={styles.startChatButton} onClick={() => setShowNewChat(true)}>
              Start a conversation
            </button>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className={styles.conversationList}>
            {conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`${styles.conversationItem} ${isActive ? styles.active : ""}`}
                  onClick={() => setSelectedConv(conv)}
                >
                  <div className={styles.avatar}>
                    {other.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className={styles.convInfo}>
                    <p className={styles.convName}>{other.displayName}</p>
                    {conv.lastMessageText && (
                      <p className={styles.convPreview}>{conv.lastMessageText}</p>
                    )}
                  </div>
                  {conv.lastMessageAt && (
                    <span className={styles.convTime}>{formatTime(conv.lastMessageAt)}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.chatArea}>
        {!selectedConv && (
          <div className={styles.noChatSelected}>
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>Your Messages</h3>
            <p>Send private messages to people in your campus</p>
            <button type="button" className={styles.startChatButton} onClick={() => setShowNewChat(true)}>
              Send message
            </button>
          </div>
        )}

        {selectedConv && (
          <>
            <div className={styles.chatHeader}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setSelectedConv(null)}
                aria-label="Back to conversations"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className={styles.avatar}>
                {getOtherParticipant(selectedConv).displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className={styles.chatName}>
                {getOtherParticipant(selectedConv).displayName}
              </span>
            </div>

            <div className={styles.messagesContainer}>
              {messagesLoading && messages.length === 0 && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                </div>
              )}

              {messages.map((msg) => {
                const isMine = msg.senderUserId === user?.userId;
                return (
                  <div
                    key={msg.id}
                    className={`${styles.messageWrapper} ${isMine ? styles.mine : styles.theirs}`}
                  >
                    <div className={styles.messageBubble}>
                      <p className={styles.messageText}>{msg.content}</p>
                      <span className={styles.messageTime}>{formatMessageTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputArea}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message..."
                className={styles.messageInput}
                disabled={sending}
                maxLength={2000}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!messageInput.trim() || sending}
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </div>

      {showNewChat && (
        <dialog open className={styles.modal}>
          <button
            type="button"
            className={styles.modalBackdrop}
            onClick={() => setShowNewChat(false)}
            aria-label="Close modal"
          />
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>New Message</h3>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowNewChat(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people..."
                className={styles.searchInput}
                autoFocus
              />
            </div>

            <div className={styles.searchResults}>
              {searching && (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                </div>
              )}

              {!searching && searchResults.length === 0 && (
                <p className={styles.noResults}>
                  {searchQuery ? "No users found" : "Search for someone to message"}
                </p>
              )}

              {!searching && searchResults.map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  className={styles.userResult}
                  onClick={() => handleStartConversation(u.userId)}
                  disabled={startingChat}
                >
                  <div className={styles.avatar}>
                    {u.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{u.displayName}</p>
                    <p className={styles.userEmail}>{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </dialog>
      )}

      {error && (
        <div className={styles.errorToast}>
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
