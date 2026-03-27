import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import baybayinData from "./data/baybayinData";
import CustomButton from "./CustomButton.js";
import towerImg from "./img/tower.png";
import magicBulletImg from "./img/magic_bullet.png";

const BOX_WIDTH = 120;
const BOX_HEIGHT = 80;
const MAX_TIME = 10;

const TapMode = ({ selectedDifficulty = "Medium", startGame = false }) => {
  const navigate = useNavigate();

  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [isPaused, setIsPaused] = useState(false);
  const [baybayinKeys, setBaybayinKeys] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [bullets, setBullets] = useState([]);
  const [ammo, setAmmo] = useState(15);
  const [displayedAmmo, setDisplayedAmmo] = useState(0); // smooth animation
  const [ammoPulse, setAmmoPulse] = useState(false); // pulse effect
  const [aimPos, setAimPos] = useState({ x: window.innerWidth / 2, y: 0 });
  const [movingTargets, setMovingTargets] = useState([]);
  const [outOfMana, setOutOfMana] = useState(false);

  const getAmmoLimit = () => {
    if (selectedDifficulty === "Easy") return 5;
    if (selectedDifficulty === "Medium") return 4;
    return 3;
  };

  const getAmmoGlowColor = () => {
    if (selectedDifficulty === "Easy") return "#22c55e";
    if (selectedDifficulty === "Medium") return "#facc15";
    return "#dc2626";
  };

  /* ================= START GAME ================= */
  useEffect(() => {
    if (!startGame) return;
    setIsGameStarted(true);
    setScore(0);
    setTargetIndex(0);
    setGameOver(false);
    setGameComplete(false);
    setOutOfMana(false);
    setIsPaused(false);
    setTimeLeft(MAX_TIME);
    setBullets([]);
    setMovingTargets([]);
    setAmmo(getAmmoLimit());
    setDisplayedAmmo(getAmmoLimit());
  }, [startGame]);

  /* ================= BAYBAYIN FILTER ================= */
  useEffect(() => {
    if (!isGameStarted) return;
    const filtered = baybayinData
      .filter((b) => b.difficulty === selectedDifficulty)
      .map((b) => b.char)
      .sort(() => Math.random() - 0.5);
    setBaybayinKeys(filtered);
  }, [isGameStarted, selectedDifficulty]);

  /* ================= SPAWN INITIAL TARGETS ================= */
  useEffect(() => {
    if (isGameStarted && baybayinKeys.length > 0) {
      spawnMovingTargets();
    }
  }, [isGameStarted, baybayinKeys, targetIndex]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!isGameStarted || isPaused || gameOver || gameComplete || outOfMana)
      return;

    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, gameOver, gameComplete, isGameStarted, outOfMana]);

  /* ================= AUTO OUT OF MANA CHECK ================= */
  useEffect(() => {
    if (!isGameStarted || gameOver || gameComplete) return;
    if (ammo <= 0 && !outOfMana) {
      setOutOfMana(true);
      setTimeLeft(0);
    }
  }, [ammo, isGameStarted, gameOver, gameComplete, outOfMana]);

  /* ================= AIM ================= */
  useEffect(() => {
    const move = (e) => setAimPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ================= SHOOT ================= */
  const shootBullet = () => {
    if (!isGameStarted || isPaused || gameOver || gameComplete || outOfMana)
      return;

    const towerX = window.innerWidth / 2;
    const towerY = window.innerHeight * 0.75;
    const angle = Math.atan2(aimPos.y - towerY, aimPos.x - towerX);

    setBullets((b) => [
      ...b,
      {
        id: Date.now() + Math.random(),
        x: towerX,
        y: towerY,
        vx: Math.cos(angle) * 14,
        vy: Math.sin(angle) * 14,
      },
    ]);

    setAmmo((a) => Math.max(0, a - 1));
  };

  /* ================= BULLET MOVE ================= */
  useEffect(() => {
    if (!isGameStarted || isPaused) return;

    const loop = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
          .filter(
            (b) =>
              b.x > 0 &&
              b.y > 0 &&
              b.x < window.innerWidth &&
              b.y < window.innerHeight
          )
      );
    }, 16);

    return () => clearInterval(loop);
  }, [isGameStarted, isPaused]);

  /* ================= SPAWN MOVING TARGETS ================= */
  const spawnMovingTargets = () => {
    const total = 5;
    const currentFind = baybayinKeys[targetIndex];
    let otherChars = baybayinKeys.filter((c) => c !== currentFind);
    otherChars = otherChars.sort(() => 0.5 - Math.random());

    const selected = [currentFind, ...otherChars.slice(0, total - 1)].sort(
      () => Math.random() - 0.5
    );

    const sectionWidth = (window.innerWidth - BOX_WIDTH * total) / (total + 1);

    const targets = selected.map((char, i) => {
      const symbol = baybayinData.find((b) => b.char === char)?.symbol || char;
      const scale =
        selectedDifficulty === "Hard"
          ? 0.7
          : selectedDifficulty === "Medium"
          ? 0.85
          : 1;
      const x = sectionWidth * (i + 1) + BOX_WIDTH * i;
      const y = 50 + Math.random() * (window.innerHeight * 0.35);

      return {
        id: Date.now() + Math.random(),
        char,
        symbol,
        scale,
        x,
        y,
        baseX: x,
        baseY: y,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amplitudeY: 10 + Math.random() * 15,
        amplitudeX: 5 + Math.random() * 5,
        hitStatus: null,
      };
    });

    setMovingTargets(targets);
  };

  /* ================= FLOATING WAVE TARGETS ================= */
  useEffect(() => {
    if (!isGameStarted || isPaused) return;

    let animationId;
    let startTime = performance.now();

    const animate = (now) => {
      const t = (now - startTime) / 1000;

      setMovingTargets((prev) =>
        prev.map((target) => ({
          ...target,
          floatOffsetY: Math.sin(t * 2 + target.phaseY) * target.amplitudeY,
          floatOffsetX: Math.sin(t * 1 + target.phaseX) * target.amplitudeX,
        }))
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isGameStarted, isPaused]);

  /* ================= SMOOTH DISPLAYED AMMO ================= */
  useEffect(() => {
    let animationId;
    const animateAmmo = () => {
      setDisplayedAmmo((prev) => {
        const diff = ammo - prev;
        if (Math.abs(diff) < 0.01) return ammo;
        return prev + diff * 0.2;
      });
      animationId = requestAnimationFrame(animateAmmo);
    };
    animationId = requestAnimationFrame(animateAmmo);
    return () => cancelAnimationFrame(animationId);
  }, [ammo]);

  /* ================= AMMO PULSE ================= */
  useEffect(() => {
    if (ammoPulse) return;
    setAmmoPulse(true);
    const timeout = setTimeout(() => setAmmoPulse(false), 300);
    return () => clearTimeout(timeout);
  }, [ammo]);

  /* ================= COLLISION & HIT LOGIC ================= */
  useEffect(() => {
    bullets.forEach((b) => {
      movingTargets.forEach((t) => {
        const tx = t.x;
        const ty = t.y;

        if (
          b.x > tx &&
          b.x < tx + BOX_WIDTH &&
          b.y > ty &&
          b.y < ty + BOX_HEIGHT
        ) {
          handleHit(t.id, b.id);
        }
      });
    });
  }, [bullets, movingTargets]);

  const handleHit = (targetId, bulletId) => {
    setBullets((b) => b.filter((x) => x.id !== bulletId));

    setMovingTargets((prev) =>
      prev.map((t) => {
        if (t.id === targetId) {
          const isCorrect = t.char === baybayinKeys[targetIndex];
          return { ...t, hitStatus: isCorrect ? "correct" : "wrong" };
        }
        return t;
      })
    );

    const hit = movingTargets.find((t) => t.id === targetId);
    if (!hit) return;

    const isCorrect = hit.char === baybayinKeys[targetIndex];
    if (isCorrect) {
      confetti({ particleCount: 80, spread: 60 });
      setScore((s) => s + 1);
      const bonus = 1;
      setAmmo((a) => Math.min(getAmmoLimit(), a + bonus));

      setTargetIndex((i) => (i + 1) % baybayinKeys.length);
      spawnMovingTargets();
    }

    setTimeout(() => {
      setMovingTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, hitStatus: null } : t))
      );
    }, 300);
  };

  /* ================= CONTROLS ================= */
  const handleRestart = () => {
    setScore(0);
    setTargetIndex(0);
    setGameOver(false);
    setGameComplete(false);
    setOutOfMana(false);
    setTimeLeft(MAX_TIME);
    setBullets([]);
    setAmmo(getAmmoLimit());
    setDisplayedAmmo(getAmmoLimit());
    spawnMovingTargets();
    setIsPaused(false);
  };

  const togglePause = () => setIsPaused((p) => !p);
  const handleResume = () => setIsPaused(false);

  /* ================= SPACEBAR SHOOT ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        shootBullet();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shootBullet]);

  /* ================= RENDER ================= */
  return (
    <div
      style={{
        ...styles.body,
        cursor: gameOver || gameComplete || isPaused ? "default" : "none",
      }}
    >
      {/* ================= FIND TEXT ================= */}
      {isGameStarted && !gameOver && !gameComplete && !isPaused && (
        <div style={styles.findText}>
          Find: <b>{baybayinKeys[targetIndex]}</b>
        </div>
      )}

      {/* ================= STATS BAR ================= */}
      <div style={styles.statsBar}>
        <div>Score: {score}</div>
        <div style={styles.timeWrapper}>
          <div style={styles.timeBarBg}>
            <div
              style={{
                ...styles.timeBarFill,
                width: `${Math.max(0, (timeLeft / MAX_TIME) * 100)}%`,
                background:
                  timeLeft <= 3
                    ? "linear-gradient(90deg,#dc2626,#f87171)"
                    : timeLeft <= 6
                    ? "linear-gradient(90deg,#facc15,#fde047)"
                    : "linear-gradient(90deg,#22c55e,#4ade80)",
              }}
            />
          </div>
          <span style={styles.timeText}>{timeLeft}s</span>
        </div>
        <div>{selectedDifficulty}</div>
        <button
          style={styles.pauseBtn}
          onClick={(e) => {
            e.stopPropagation();
            togglePause();
          }}
        >
          {isPaused ? "▶" : "⏸"}
        </button>
      </div>

      {/* ================= MOVING TARGETS ================= */}
      {movingTargets.map((t) => {
        let fontSize = "2.4rem";
        let boxHeight = BOX_HEIGHT;
        if (selectedDifficulty === "Hard") {
          fontSize = "1.5rem";
          boxHeight = 120;
        }

        let backgroundColor = "#fff7e6";
        if (t.hitStatus === "correct") backgroundColor = "#a8e6a1";
        if (t.hitStatus === "wrong") backgroundColor = "#fca5a5";

        return (
          <div
            key={t.id}
            style={{
              position: "absolute",
              left: t.x + (t.floatOffsetX || 0),
              top: t.y + (t.floatOffsetY || 0),
              width: BOX_WIDTH,
              height: boxHeight,
              background: backgroundColor,
              borderRadius: 18,
              boxShadow: "0 6px 18px rgba(0,0,0,.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              zIndex: 5,
              padding: 5,
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                transform: `scale(${t.scale})`,
                fontSize: fontSize,
                lineHeight: "1.2em",
                wordBreak: "break-word",
              }}
            >
              {t.symbol}
            </div>
          </div>
        );
      })}

      {/* ================= BULLETS ================= */}
      {!isPaused &&
        bullets.map((b) => (
          <img
            key={b.id}
            src={magicBulletImg}
            alt=""
            style={{
              position: "absolute",
              left: b.x - 15,
              top: b.y - 15,
              width: 40,
              height: 40,
              pointerEvents: "none",
              zIndex: 6,
            }}
          />
        ))}

      {/* ================= TOWER ================= */}
      {!gameOver && !gameComplete && isGameStarted && !isPaused && (
        <div style={styles.towerContainer}>
          <img src={towerImg} alt="" style={{ width: 220 }} />
          <svg
            width="50"
            height="50"
            style={{
              position: "absolute",
              left: "50%",
              bottom: "100%",
              transform: `translateX(-50%) translateY(-10px) scale(${
                ammoPulse ? 1.3 : 1
              })`,
              zIndex: 10,
              transition: "transform 0.3s ease-out",
              filter: ammoPulse
                ? `drop-shadow(0 0 12px ${getAmmoGlowColor()})`
                : "none",
            }}
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke={getAmmoGlowColor()}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={
                2 * Math.PI * 20 *
                (1 -
                  displayedAmmo /
                    (selectedDifficulty === "Easy"
                      ? 5
                      : selectedDifficulty === "Medium"
                      ? 4
                      : 3))
              }
              strokeLinecap="round"
              transform="rotate(-90 25 25)"
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#fff"
              fontSize="14"
              fontWeight="bold"
            >
              {Math.round(displayedAmmo)}
            </text>
          </svg>
        </div>
      )}

      {/* ================= AIM CROSS ================= */}
      {isGameStarted && !isPaused && !gameOver && !gameComplete && (
        <div
          style={{
            position: "absolute",
            left: aimPos.x - 15,
            top: aimPos.y - 15,
            width: 30,
            height: 30,
            border: "2px solid black",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 2,
              height: "100%",
              background: "black",
              transform: "translateX(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 2,
              width: "100%",
              background: "black",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      )}

      {/* ================= MODALS ================= */}
      {(gameOver || gameComplete) && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>{gameOver ? "⏰ Time's Up!" : "🏆 You Win!"}</h2>
            <p>Final Score: {score}</p>
            <div style={styles.horizontalButtonGroup}>
              <CustomButton label="Restart" onClick={handleRestart} />
              <CustomButton label="Exit" onClick={() => navigate("/HomeGame")} />
            </div>
          </div>
        </div>
      )}

      {outOfMana && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⚡ Oops! You're Out of Mana!</h2>
            <p>Final Score: {score}</p>
            <div style={styles.horizontalButtonGroup}>
              <CustomButton label="Restart" onClick={handleRestart} />
              <CustomButton label="Exit" onClick={() => navigate("/HomeGame")} />
            </div>
          </div>
        </div>
      )}

      {isPaused && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>⏸ Paused</h2>
            <div style={styles.horizontalButtonGroup}>
              <CustomButton label="Resume" onClick={handleResume} />
              <CustomButton label="Exit" onClick={() => navigate("/HomeGame")} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  body: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#C2410C,#EA580C)",
    position: "relative",
    overflow: "hidden",
    cursor: "none",
  },
  towerContainer: {
    position: "absolute",
    bottom: "5%",
    left: "50%",
    transform: "translateX(-50%)",
  },
  findText: {
    position: "absolute",
    top: 10,
    left: 20,
    fontSize: "1.8rem",
    color: "#fff",
    zIndex: 10,
  },
  statsBar: {
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 20,
    padding: "10px 25px",
    background: "rgba(255,255,255,.15)",
    borderRadius: 20,
    color: "#fff",
    zIndex: 10,
  },
  pauseBtn: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    textAlign: "center",
  },
  horizontalButtonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
  },
  timeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 140,
  },
  timeBarBg: {
    width: 100,
    height: 12,
    background: "rgba(255,255,255,.25)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,.3)",
  },
  timeBarFill: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.4s linear, background 0.3s",
  },
  timeText: {
    fontSize: "0.9rem",
    opacity: 0.9,
  },
};

export default TapMode;
