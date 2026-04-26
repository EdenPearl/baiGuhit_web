import React, { useState } from 'react';

// ============================================
// BAYBAYIN DATA
// ============================================

const VOWELS = {
  'a': 'ᜀ',
  'e': 'ᜁ',
  'i': 'ᜁ',
  'o': 'ᜂ',
  'u': 'ᜂ',
};

const CONSONANTS = {
  'b': 'ᜊ', 'k': 'ᜃ', 'd': 'ᜇ', 'r': 'ᜇ',
  'g': 'ᜄ', 'h': 'ᜑ', 'l': 'ᜎ', 'm': 'ᜋ',
  'n': 'ᜈ', 'ng': 'ᜅ', 'p': 'ᜉ', 's': 'ᜐ',
  't': 'ᜆ', 'w': 'ᜏ', 'y': 'ᜌ',
};

const KUDLIT = {
  'e': 'ᜒ', 'i': 'ᜒ',
  'o': 'ᜓ', 'u': 'ᜓ',
};

const VIRAMA = '᜔';

// ============================================
// TRANSLATION FUNCTION
// ============================================

function toBaybayin(text) {
  text = text.toLowerCase().trim();
  let result = [];
  let i = 0;

  while (i < text.length) {
    let char = text[i];

    if (char === ' ') {
      result.push(' ');
      i++;
      continue;
    }

    if (char === 'n' && i + 1 < text.length && text[i + 1] === 'g') {
      char = 'ng';
      i++;
    }

    if (i + 1 < text.length && 'aeiou'.includes(text[i + 1])) {
      let nextVowel = text[i + 1];

      if (char in CONSONANTS) {
        let base = CONSONANTS[char];
        if (nextVowel === 'a') {
          result.push(base);
        } else {
          result.push(base + KUDLIT[nextVowel]);
        }
        i += 2;
        continue;
      }
    }

    if (char in VOWELS) {
      result.push(VOWELS[char]);
      i++;
      continue;
    }

    if (char in CONSONANTS) {
      result.push(CONSONANTS[char] + VIRAMA);
      i++;
      continue;
    }

    result.push(char);
    i++;
  }

  return result.join('');
}

// ============================================
// DATA
// ============================================

const ALL_CHARS = [
  { l: 'a', b: 'ᜀ' }, { l: 'e/i', b: 'ᜁ' }, { l: 'o/u', b: 'ᜂ' },
  { l: 'ba', b: 'ᜊ' }, { l: 'ka', b: 'ᜃ' }, { l: 'da/ra', b: 'ᜇ' },
  { l: 'ga', b: 'ᜄ' }, { l: 'ha', b: 'ᜑ' }, { l: 'la', b: 'ᜎ' },
  { l: 'ma', b: 'ᜋ' }, { l: 'na', b: 'ᜈ' }, { l: 'nga', b: 'ᜅ' },
  { l: 'pa', b: 'ᜉ' }, { l: 'sa', b: 'ᜐ' }, { l: 'ta', b: 'ᜆ' },
  { l: 'wa', b: 'ᜏ' }, { l: 'ya', b: 'ᜌ' },
];

// ============================================
// STYLES — DARK GOLD THEME (matches HomeGame)
// ============================================

const styles = {
  bodyWrapper: {
    margin: 0,
    padding: 0,
    fontFamily: "'Georgia', serif",
    background: '#6b1f00',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
  },
  bgTexture: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(0,0,0,0.04) 60px, rgba(0,0,0,0.04) 61px)',
  },
  bgRadial: {
    position: 'absolute',
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80vw',
    height: '80vw',
    maxWidth: '700px',
    maxHeight: '700px',
    borderRadius: '50%',
    zIndex: 1,
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(251,196,23,0.10) 0%, transparent 70%)',
  },
  // BACK BUTTON — outside container, top left
  backBtn: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 100,
    background: 'rgba(251, 196, 23, 0.12)',
    border: '1px solid rgba(251, 196, 23, 0.35)',
    borderRadius: '12px',
    padding: '10px 20px',
    color: '#fde68a',
    fontFamily: "'Georgia', serif",
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  container: {
    background: 'linear-gradient(170deg, #2c1204 0%, #3d1a06 50%, #1e0d03 100%)',
    borderRadius: '22px',
    padding: '28px 36px',
    maxWidth: '1000px',
    width: '90%',
    height: '88vh',
    maxHeight: '640px',
    border: '1px solid rgba(251, 196, 23, 0.25)',
    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 220, 120, 0.1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },
  topBar: {
    height: '4px',
    background: 'linear-gradient(90deg, #fde68a, #fbc417, #f59e0b, #fbc417, #fde68a)',
    backgroundSize: '300% 100%',
    borderRadius: '2px',
    marginBottom: '16px',
    flexShrink: 0,
  },
  header: {
    textAlign: 'center',
    marginBottom: '14px',
    flexShrink: 0,
  },
  h1: {
    color: '#fde68a',
    margin: '0 0 4px 0',
    fontSize: '1.9em',
    letterSpacing: '3px',
    fontWeight: 900,
    textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 0 16px rgba(251,196,23,0.35)',
  },
  subtitle: {
    color: 'rgba(253, 230, 138, 0.5)',
    margin: 0,
    fontSize: '0.85em',
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: '24px',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  leftPanel: {
    flex: '1 1 55%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: 0,
    justifyContent: 'flex-start',
  },
  rightPanel: {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
    overflow: 'hidden',
  },
  // OUTPUT BOX — styled like scripture stone panel
  outputGroup: {
    flexShrink: 0,
  },
  outputLabel: {
    display: 'block',
    color: 'rgba(253, 230, 138, 0.6)',
    marginBottom: '6px',
    fontSize: '0.8em',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  outputBox: {
    background: 'linear-gradient(135deg, #4a1c08 0%, #2e1005 55%, #1a0802 100%)',
    border: '1.5px solid rgba(251, 196, 23, 0.3)',
    borderRadius: '14px',
    padding: '20px',
    minHeight: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(251,196,23,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  outputGlow: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,196,23,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(10px)',
  },
  outputText: {
    color: '#fde68a',
    fontSize: '2em',
    textAlign: 'center',
    wordBreak: 'break-all',
    lineHeight: 1.4,
    textShadow: '0 0 20px rgba(251,196,23,0.85), 0 0 42px rgba(251,196,23,0.45), 0 3px 12px rgba(0,0,0,0.8)',
    fontFamily: "'Noto Sans Tagalog', 'Noto Serif Tagalog', 'Noto Serif', 'Georgia', serif",
    position: 'relative',
    zIndex: 2,
  },
  outputPlaceholder: {
    color: 'rgba(253, 230, 138, 0.25)',
    fontSize: '0.95em',
    fontStyle: 'italic',
  },
  // INPUT BOX — at the bottom
  inputGroup: {
    flexShrink: 0,
    marginTop: '4px',
  },
  inputLabel: {
    display: 'block',
    color: 'rgba(253, 230, 138, 0.6)',
    marginBottom: '6px',
    fontSize: '0.8em',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '1.5px solid rgba(251, 196, 23, 0.35)',
    borderRadius: '12px',
    background: 'rgba(0, 0, 0, 0.35)',
    color: '#fff4df',
    fontSize: '1.05em',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: "'Georgia', serif",
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
  },
  inputFocus: {
    borderColor: 'rgba(251, 196, 23, 0.65)',
    boxShadow: '0 0 15px rgba(251, 196, 23, 0.15), inset 0 2px 6px rgba(0,0,0,0.3)',
  },
  // CHARACTER MAP
  charMap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#fde68a',
    margin: '0 0 10px 0',
    fontSize: '0.85em',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  charGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
    textAlign: 'center',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  charCell: {
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '8px 4px',
    borderRadius: '10px',
    border: '1px solid rgba(251, 196, 23, 0.15)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  charCellHover: {
    background: 'rgba(251, 196, 23, 0.12)',
    borderColor: 'rgba(251, 196, 23, 0.4)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  charBaybayin: {
    color: '#fde68a',
    fontSize: '1.4em',
    display: 'block',
    textShadow: '0 0 8px rgba(251,196,23,0.4)',
    fontFamily: "'Noto Sans Tagalog', 'Noto Serif Tagalog', 'Noto Serif', 'Georgia', serif",
  },
  charLatin: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.7em',
    marginTop: '2px',
    display: 'block',
  },
};

// ============================================
// COMPONENT
// ============================================

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);

  const outputText = inputText.trim() === '' ? '' : toBaybayin(inputText);

  // Back navigation handler
  const goBack = () => {
    window.history.back();
  };

  return (
    <div style={styles.bodyWrapper}>
      {/* Background texture layers matching HomeGame */}
      <div style={styles.bgTexture} />
      <div style={styles.bgRadial} />

      {/* BACK BUTTON — outside container, top left */}
      <button style={styles.backBtn} onClick={goBack}>
        ← Back
      </button>

      <div style={styles.container}>
        {/* Gold shimmer top bar */}
        <div style={styles.topBar} />

        <div style={styles.header}>
          <h1 style={styles.h1}>ᜊᜌ᜔ᜊᜌᜒᜈ᜔</h1>
          <p style={styles.subtitle}>Baybayin Translator</p>
        </div>

        <div style={styles.mainContent}>
          {/* LEFT PANEL — Output on top, Input at bottom */}
          <div style={styles.leftPanel}>
            {/* OUTPUT — at the top */}
            <div style={styles.outputGroup}>
              <label style={styles.outputLabel}>Baybayin Output:</label>
              <div style={styles.outputBox}>
                <div style={styles.outputGlow} />
                {outputText ? (
                  <span style={styles.outputText}>{outputText}</span>
                ) : (
                  <span style={styles.outputPlaceholder}>
                    Your translation will appear here...
                  </span>
                )}
              </div>
            </div>

            {/* INPUT — at the bottom */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Type in Latin script:</label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="e.g., ako si Joel, maganda, salamat..."
                autoComplete="off"
                style={{
                  ...styles.input,
                  ...(isFocused ? styles.inputFocus : {}),
                }}
              />
            </div>
          </div>

          {/* RIGHT PANEL — Character Map */}
          <div style={styles.rightPanel}>
            <div style={styles.charMap}>
              <h3 style={styles.sectionTitle}>Character Map:</h3>
              <div style={styles.charGrid}>
                {ALL_CHARS.map((c, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.charCell,
                      ...(hoveredChar === index ? styles.charCellHover : {}),
                    }}
                    onMouseEnter={() => setHoveredChar(index)}
                    onMouseLeave={() => setHoveredChar(null)}
                    onClick={() => setInputText((prev) => prev + c.l.replace('/','').replace('a',''))}
                  >
                    <span style={styles.charBaybayin}>{c.b}</span>
                    <span style={styles.charLatin}>{c.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}