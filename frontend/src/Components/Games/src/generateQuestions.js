/* ---------------- ANIMATIONS ---------------- */
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const flashUp = keyframes`
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const slideFromLeft = keyframes`
  from { transform: translateX(-200px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideFromRight = keyframes`
  from { transform: translateX(200px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideFromTop = keyframes`
  from { transform: translateY(-150px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;