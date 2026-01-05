"use client";

import { useState, useEffect, useRef } from "react";
import type { Theme } from "@/shared/config";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  savedEmails: string[];
  onRemoveEmail: (email: string) => void;
  error?: string;
  theme: Theme;
}

export function EmailInput({ value, onChange, savedEmails, onRemoveEmail, error, theme }: EmailInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (email: string) => {
    onChange(email);
    setIsOpen(false);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsTyping(true);
  };

  const handleInputFocus = () => {
    if (savedEmails.length > 0 && !isTyping) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="이메일 입력 또는 선택"
          className="w-full px-4 py-3 pr-10 font-mono focus:outline-none"
          style={{
            background: theme.colors.bgDark,
            border: `2px solid ${error ? theme.colors.error : theme.colors.border}`,
            color: theme.colors.text,
          }}
        />
        {savedEmails.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm font-mono" style={{ color: theme.colors.error }}>
          &gt; {error}
        </p>
      )}

      {isOpen && savedEmails.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 shadow-lg max-h-48 overflow-y-auto"
          style={{
            background: theme.colors.bg,
            border: `2px solid ${theme.colors.border}`,
          }}
        >
          <div
            className="px-3 py-2 text-xs font-mono border-b"
            style={{ color: theme.colors.textDim, borderColor: theme.colors.borderDim }}
          >
            [ 최근 로그인 ]
          </div>
          {savedEmails.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between px-3 py-2 cursor-pointer group"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.colors.bgLight)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <button
                type="button"
                onClick={() => handleSelect(email)}
                className="flex-1 text-left font-mono text-sm truncate"
                style={{ color: theme.colors.text }}
              >
                &gt; {email}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveEmail(email);
                }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: theme.colors.textMuted }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsTyping(true);
              inputRef.current?.focus();
            }}
            className="w-full px-3 py-2 text-left font-mono text-sm border-t"
            style={{
              color: theme.colors.textDim,
              borderColor: theme.colors.borderDim,
            }}
          >
            + 직접 입력
          </button>
        </div>
      )}
    </div>
  );
}
