import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getFaqMatch } from '../faqDatabase';

const LANG_LABELS = { en: 'ENG', hi: 'HIN', mr: 'MAR' };
const LANG_CODES  = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };

export default function Chatbot({ lang, onDataExtracted }) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [activeLang,  setActiveLang]  = useState(lang || 'en');
  const [messages,    setMessages]    = useState([{
    role: 'assistant',
    content: 'Hello! I am your TB Assistant. Click the mic and ask about TB symptoms, treatment, or diagnosis.'
  }]);
  const [inputText,   setInputText]   = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [soundActive, setSoundActive] = useState(false);
  const [statusTxt,   setStatusTxt]   = useState('');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [micOk,       setMicOk]       = useState(null);
  const [retryNum,    setRetryNum]    = useState(0);

  const recRef         = useRef(null);
  const listeningRef   = useRef(false);
  const retryRef       = useRef(0);
  const activeLangRef  = useRef(activeLang);
  const messagesEndRef = useRef(null);

  useEffect(() => { setActiveLang(lang || 'en'); }, [lang]);
  useEffect(() => { activeLangRef.current = activeLang; }, [activeLang]);
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const extractClinicalData = useCallback((text) => {
    const lower = text.toLowerCase();
    const result = { symptoms: {}, duration: null };

    // Symptom Keywords (Multilingual)
    const keywords = {
      cough: ['cough', 'khansi', 'khokala', 'khasi'],
      fever: ['fever', 'bukhaar', 'tap', 'buhar'],
      weightLoss: ['weight loss', 'vajan kam', 'weight kam'],
      hemoptysis: ['blood', 'khoon', 'rakt', 'spitum'],
      chestPain: ['chest pain', 'seene mein dard', 'chati', 'chest'],
    };

    Object.keys(keywords).forEach(key => {
      if (keywords[key].some(k => lower.includes(k))) {
        result.symptoms[key] = true;
      }
    });

    // Duration Extraction (e.g., "15 days", "2 weeks")
    const dayMatch = lower.match(/(\d+)\s*(day|days|din|divas)/);
    const weekMatch = lower.match(/(\d+)\s*(week|weeks|hafte|hapte)/);

    if (dayMatch) result.duration = parseInt(dayMatch[1]);
    else if (weekMatch) result.duration = parseInt(weekMatch[1]) * 7;

    if (Object.keys(result.symptoms).length > 0 || result.duration) {
      if (onDataExtracted) onDataExtracted(result);
    }
  }, [onDataExtracted]);

  const speak = useCallback((text, rLang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_CODES[rLang] || 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  const handleQuery = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    // Trigger Extraction
    extractClinicalData(trimmed);

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);


    setInputText('');
    setIsLoading(true);
    setStatusTxt('');
    setTimeout(() => {
      const result  = getFaqMatch(trimmed, activeLangRef.current);
      const content = result?.content || "I don't have info on that. Ask about TB symptoms, CBNAAT, DOTS, or treatment.";
      const rLang   = result?.lang ?? activeLangRef.current;
      setMessages(prev => [...prev, { role: 'assistant', content }]);
      speak(content, rLang);
      setIsLoading(false);
    }, 500);
  }, [speak]);

  const testMic = useCallback(async () => {
    setStatusTxt('Testing microphone access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicOk(true);
      setErrorMsg('');
      setStatusTxt('Microphone is working! Now click the mic button and speak.');
    } catch (err) {
      setMicOk(false);
      setStatusTxt('');
      setErrorMsg('Mic blocked: ' + err.message + '. Click the lock in Chrome address bar → allow mic.');
    }
  }, []);

  const startRec = useCallback((isRetry) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErrorMsg('Voice not supported. Please use Google Chrome.'); return; }

    const rec     = new SR();
    rec.lang      = LANG_CODES[activeLangRef.current];
    rec.continuous     = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    if (!isRetry) {
      retryRef.current = 0;
      setRetryNum(0);
      setErrorMsg('');
      setInputText('');
    }

    rec.onaudiostart  = () => setStatusTxt('Listening in ' + LANG_LABELS[activeLangRef.current] + '... speak now');
    rec.onsoundstart  = () => { setSoundActive(true); };
    rec.onspeechstart = () => { setSoundActive(true); setStatusTxt('Voice detected, keep talking...'); };
    rec.onspeechend   = () => { setSoundActive(false); setStatusTxt('Processing your question...'); };
    rec.onsoundend    = () => setSoundActive(false);

    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        retryRef.current = 0;
        listeningRef.current = false;
        recRef.current = null;
        setIsListening(false);
        setSoundActive(false);
        setInputText(final);
        handleQuery(final);
      } else {
        setInputText(interim);
      }
    };

    rec.onerror = (e) => {
      console.warn('[SR] Error:', e.error);
      if (e.error === 'no-speech') {
        if (retryRef.current < 4 && listeningRef.current) {
          retryRef.current++;
          setRetryNum(retryRef.current);
          setStatusTxt('Still listening, attempt ' + (retryRef.current + 1) + '/5. Speak now...');
          setTimeout(() => { if (listeningRef.current) startRec(true); }, 300);
        } else {
          listeningRef.current = false;
          recRef.current = null;
          setIsListening(false);
          setSoundActive(false);
          setStatusTxt('');
          setErrorMsg('Could not hear you after 5 tries. Check: (1) Windows mic volume in Sound Settings, (2) click MIC TEST above.');
        }
        return;
      }
      listeningRef.current = false;
      recRef.current = null;
      setIsListening(false);
      setSoundActive(false);
      const map = {
        'not-allowed':        'Mic blocked. Click the lock icon in Chrome URL bar and choose Allow Microphone.',
        'audio-capture':      'No microphone found. Plug one in and try again.',
        'network':            'Network error. Voice recognition needs internet. Check your connection.',
        'service-not-allowed':'Mic access denied by browser policy. Allow this site in Chrome Settings.',
        'aborted':            '',
      };
      const msg = map[e.error];
      if (msg !== undefined) setErrorMsg(msg);
      else setErrorMsg('Voice error: ' + e.error + '. Try again or type your question.');
      setStatusTxt('');
    };

    rec.onend = () => {
      if (!listeningRef.current) {
        setSoundActive(false);
        setStatusTxt('');
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      listeningRef.current = true;
      setIsListening(true);
    } catch (err) {
      listeningRef.current = false;
      setErrorMsg('Could not start mic: ' + err.message);
      setIsListening(false);
    }
  }, [handleQuery]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    recRef.current?.abort();
    recRef.current = null;
    setIsListening(false);
    setSoundActive(false);
    setStatusTxt('');
    retryRef.current = 0;
    setRetryNum(0);
  }, []);

  useEffect(() => () => stopListening(), [stopListening]);

  const toggleMic = () => { if (isListening) stopListening(); else startRec(false); };
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isListening) stopListening();
    if (inputText.trim()) handleQuery(inputText);
  };

  const placeholderText = isListening
    ? (soundActive ? 'Hearing you...' : 'Listening — speak now...')
    : isLoading ? 'Thinking...' : 'Ask about TB or click mic';

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open TB Assistant"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f766e, #0891b2)',
            border: 'none', cursor: 'pointer', fontSize: '1.5rem',
            boxShadow: '0 6px 24px rgba(8,145,178,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          💬
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 340, minHeight: 520, maxHeight: 590,
          background: '#0b1120',
          border: '1px solid rgba(34,211,238,0.2)',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.25s ease',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg,#0f766e,#0891b2)',
            padding: '0.8rem 1rem', flexShrink: 0,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                🩺 TB Voice Assistant
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                {['en', 'hi', 'mr'].map(l => (
                  <span
                    key={l}
                    onClick={() => { setActiveLang(l); setErrorMsg(''); }}
                    style={{
                      fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px',
                      borderRadius: 4, cursor: 'pointer', letterSpacing: 0.5,
                      background: activeLang === l ? 'white' : 'rgba(255,255,255,0.22)',
                      color: activeLang === l ? '#0f766e' : 'white',
                      transition: 'all 0.2s', textTransform: 'uppercase',
                    }}
                  >{LANG_LABELS[l]}</span>
                ))}
                <span
                  onClick={testMic}
                  title="Test microphone"
                  style={{
                    fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px',
                    borderRadius: 4, cursor: 'pointer', letterSpacing: 0.5,
                    background: micOk === true ? '#10b981' : micOk === false ? '#ef4444' : 'rgba(255,255,255,0.15)',
                    color: 'white', marginLeft: 2,
                  }}
                >
                  {micOk === true ? '✅MIC' : micOk === false ? '❌MIC' : '🔍MIC'}
                </span>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); stopListening(); }}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.1rem', cursor: 'pointer' }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: 8, background: '#0b1120',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '87%',
                background: m.role === 'user'
                  ? 'linear-gradient(135deg,#0f766e,#0891b2)'
                  : 'rgba(30,41,59,0.95)',
                color: 'white',
                padding: '0.55rem 0.9rem',
                borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                fontSize: '0.875rem', lineHeight: 1.5,
                border: m.role === 'assistant' ? '1px solid rgba(34,211,238,0.13)' : 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>{m.content}</div>
            ))}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(30,41,59,0.95)',
                border: '1px solid rgba(34,211,238,0.13)',
                padding: '0.6rem 1rem',
                borderRadius: '14px 14px 14px 4px',
                display: 'flex', gap: 5,
              }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#94a3b8',
                    display: 'inline-block',
                    animation: 'dotBounce 1s ' + d + 's infinite',
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Status / error bar */}
          {(statusTxt || errorMsg) && (
            <div style={{
              background: errorMsg ? 'rgba(127,29,29,0.7)' : 'rgba(15,118,110,0.2)',
              borderTop: '1px solid ' + (errorMsg ? 'rgba(239,68,68,0.3)' : 'rgba(34,211,238,0.15)'),
              color: errorMsg ? '#fca5a5' : '#67e8f9',
              fontSize: '0.7rem', padding: '0.3rem 0.8rem',
              lineHeight: 1.5, flexShrink: 0, textAlign: 'center',
            }}>
              {errorMsg ? ('⚠️ ' + errorMsg) : ('ℹ️ ' + statusTxt)}
            </div>
          )}

          {/* Listening bar */}
          {isListening && (
            <div style={{
              background: soundActive ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)',
              borderTop: '1px solid rgba(239,68,68,0.25)',
              padding: '0.35rem 1rem', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', color: '#fca5a5',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                display: 'inline-block',
                animation: 'micPulse ' + (soundActive ? '0.6s' : '1.4s') + ' infinite',
              }} />
              {soundActive
                ? 'Voice detected — keep talking!'
                : retryNum > 0
                  ? 'Retrying (' + retryNum + '/5)... speak louder'
                  : 'Listening in ' + LANG_LABELS[activeLang] + '... say something'}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex', gap: 6, padding: '0.65rem 0.75rem', flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0f172a',
          }}>
            <input
              value={inputText}
              onChange={e => { setInputText(e.target.value); setErrorMsg(''); }}
              placeholder={placeholderText}
              disabled={isLoading}
              style={{
                flex: 1, borderRadius: 8, padding: '0.55rem 0.75rem',
                background: isListening ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (isListening ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'),
                color: 'white', fontSize: '0.875rem', outline: 'none',
                transition: 'border-color 0.3s',
              }}
            />
            <button
              type="button"
              onClick={toggleMic}
              title={isListening ? 'Stop' : 'Start voice input'}
              style={{
                background: isListening
                  ? (soundActive ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.12)')
                  : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (isListening ? '#ef4444' : 'rgba(255,255,255,0.15)'),
                borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem',
                minWidth: 40, minHeight: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: soundActive ? 'micPulse 0.6s infinite' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isListening ? '⏹' : '🎤'}
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              style={{
                background: (isLoading || !inputText.trim())
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg,#0f766e,#0891b2)',
                border: 'none', borderRadius: 8,
                cursor: (isLoading || !inputText.trim()) ? 'default' : 'pointer',
                color: (isLoading || !inputText.trim()) ? '#475569' : 'white',
                minWidth: 40, minHeight: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', transition: 'all 0.2s',
              }}
            >➤</button>
          </form>
        </div>
      )}
    </>
  );
}
