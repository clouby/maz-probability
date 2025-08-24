// Variables globales del juego
let player1 = {};
let player2 = {};
let currentPlayer = 1;
let turnCount = 0;

// Referencias a elementos del DOM
const startScreen = document.getElementById("start-screen");
const characterSelectScreen = document.getElementById(
  "character-select-screen",
);
const gameScreen = document.getElementById("game-screen");
const startButton = document.getElementById("start-button");
const startGameButton = document.getElementById("start-game-button");
const player1NameInput = document.getElementById("player1-name");
const player1RoleSelect = document.getElementById("player1-role");
const player2NameInput = document.getElementById("player2-name");
const player2RoleSelect = document.getElementById("player2-role");

const player1HealthBar = document.getElementById("player1-health-bar");
const player1HealthText = document.getElementById("player1-health-text");
const player1NameDisplay = document.getElementById("player1-name-display");
const player1RoleDisplay = document.getElementById("player1-role-display");
const player1PotionsCount = document.getElementById("player1-potions-count");
const player1Icon = document.getElementById("player1-icon");

const player2HealthBar = document.getElementById("player2-health-bar");
const player2HealthText = document.getElementById("player2-health-text");
const player2NameDisplay = document.getElementById("player2-name-display");
const player2RoleDisplay = document.getElementById("player2-role-display");
const player2PotionsCount = document.getElementById("player2-potions-count");
const player2Icon = document.getElementById("player2-icon");

const player1Actions = document.getElementById("player1-actions");
const player2Actions = document.getElementById("player2-actions");

const gameLog = document.getElementById("game-log");
const diceRollDisplay = document.getElementById("dice-roll");
const turnCountDisplay = document.getElementById("turn-count");
const gameOverMessage = document.getElementById("game-over-message");
const gameOverText = document.getElementById("game-over-text");

const backgroundMusic = document.getElementById("background-music");
const musicToggleButton = document.getElementById("music-toggle");

const guerreroAttackSound = document.getElementById("guerrero-attack-sound");
const magoAttackSound = document.getElementById("mago-attack-sound");
const arqueroAttackSound = document.getElementById("arquero-attack-sound");

const typingSound = document.getElementById("typing-sound");

backgroundMusic.volume = 0.05;
typingSound.volume = 0.1;

const logColors = {
  guerrero: "#8b0000",
  mago: "#4b0082",
  arquero: "#006400",
};

// Función para agregar un mensaje al log con estilo
function addLog(message, color) {
  const p = document.createElement("p");
  if (color) {
    p.style.color = color;
  }
  p.textContent = `> ${message}`;
  gameLog.appendChild(p);
  gameLog.scrollTop = gameLog.scrollHeight;
}

// Función para actualizar las barras de vida
function updateHealthBars() {
  player1HealthBar.style.width = `${player1.health}%`;
  player1HealthText.textContent = `${player1.health}/100`;
  player2HealthBar.style.width = `${player2.health}%`;
  player2HealthText.textContent = `${player2.health}/100`;

  const updateBarColor = (health, bar) => {
    if (health < 30) {
      bar.style.backgroundColor = "#ff0000";
    } else if (health < 60) {
      bar.style.backgroundColor = "#ffc107";
    } else {
      bar.style.backgroundColor = "#00ff00";
    }
  };

  updateBarColor(player1.health, player1HealthBar);
  updateBarColor(player2.health, player2HealthBar);
}

// Función para terminar el juego
function endGame(winnerName) {
  disableAllButtons();
  gameOverText.textContent = `¡${winnerName} ha ganado!`;
  gameOverMessage.style.display = "flex";
}

// Reproduce el efecto de escribir
function playTypingSound() {
  typingSound.currentTime = 0;
  typingSound.play();
}

// Función para restablecer el juego al estado inicial
function resetGame() {
  // Restablecer variables
  player1 = {};
  player2 = {};
  currentPlayer = 1;
  turnCount = 0;

  // Limpiar la interfaz de usuario
  gameLog.innerHTML = "<p>¡Los héroes se preparan para el combate!</p>";
  turnCountDisplay.textContent = turnCount;
  gameOverMessage.style.display = "none";
  gameScreen.style.display = "none";
  characterSelectScreen.style.display = "none";
  startScreen.style.display = "flex";
}

// Función para deshabilitar todos los botones de acción
function disableAllButtons() {
  const allButtons = document.querySelectorAll(".actions button");
  allButtons.forEach((button) => {
    button.disabled = true;
  });
}

// Función para habilitar los botones del jugador actual
function enableCurrentPlayerButtons() {
  disableAllButtons();
  const player = currentPlayer === 1 ? player1 : player2;
  const actionsDiv = currentPlayer === 1 ? player1Actions : player2Actions;

  actionsDiv.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });

  // El botón de ataque especial se deshabilita hasta que el dado saque 6
  player.specialButton.disabled = true;

  // Si el ataque especial ya se usó, se mantiene deshabilitado permanentemente
  if (player.specialUsed) {
    player.specialButton.disabled = true;
  }
}

function playSoundAttack(attacker) {
  switch (attacker.role) {
    case "guerrero":
      guerreroAttackSound.play();
      break;
    case "mago":
      magoAttackSound.play();
      break;
    case "arquero":
      arqueroAttackSound.play();
      break;
  }
}

// Función de turno
function playerTurn(action, diceRoll) {
  const attacker = currentPlayer === 1 ? player1 : player2;
  const defender = currentPlayer === 1 ? player2 : player1;

  disableAllButtons();

  turnCount++;
  turnCountDisplay.textContent = turnCount;

  diceRollDisplay.textContent = diceRoll;

  addLog(
    `${attacker.name} (${attacker.role}) tira el dado y obtiene un ${diceRoll}.`,
    logColors[attacker.role],
  );

  let damage = 0;
  let logMessage = "";

  if (action === "attack" || action === "special") {
    playSoundAttack(attacker);
  }

  if (action === "attack") {
    // Lógica de ataque normal unificada para todos los roles
    damage = diceRoll > 3 ? 20 : diceRoll === 3 ? 15 : 5;
    logMessage =
      diceRoll > 3
        ? `¡${attacker.name} asesta un golpe poderoso con su ataque!`
        : `El ataque de ${attacker.name} es menos efectivo.`;
  } else if (action === "special") {
    // Lógica de ataque especial
    attacker.specialUsed = true;
    damage = 20; // Daño base del ataque especial
    switch (attacker.role) {
      case "guerrero":
        damage *= diceRoll > 3 ? 2 : diceRoll === 3 ? 1.5 : 1;
        logMessage = `¡${attacker.name} desata su Espada Gigante de Acero!`;
        break;
      case "mago":
        damage *= diceRoll > 4 ? 2.5 : diceRoll >= 2 ? 1.5 : 0.5;
        logMessage = `¡${attacker.name} invoca una Bola de Fuego Gigante!`;
        break;
      case "arquero":
        damage *= diceRoll > 2 ? 2 : 1.2;
        logMessage = `¡${attacker.name} dispara una Lluvia de Flechas Venenosas!`;
        if (diceRoll === 6) {
          damage *= 1.5;
          logMessage += ` ¡Y acierta todas!`;
        }
        break;
    }
  } else if (action === "defend") {
    attacker.isDefending = true;
    addLog(`${attacker.name} se prepara para defenderse del próximo ataque.`);
    // Cambiar de turno
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    addLog(
      `Es el turno de ${currentPlayer === 1 ? player1.name : player2.name}.`,
    );
    // Habilitar botones del nuevo jugador
    setTimeout(enableCurrentPlayerButtons, 500);
    return; // Termina el turno sin infligir daño
  } else if (action === "potion") {
    if (attacker.potions > 0) {
      const healAmount = diceRoll * 5;
      attacker.health += healAmount;
      if (attacker.health > 100) attacker.health = 100;
      attacker.potions--;
      addLog(
        `${attacker.name} usa una poción y se cura ${healAmount} puntos de vida. Le quedan ${attacker.potions} pociones.`,
      );
      updatePotionsCount();
    } else {
      addLog(`A ${attacker.name} no le quedan pociones. Pierde el turno.`);
    }
    // Cambiar de turno
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    addLog(
      `Es el turno de ${currentPlayer === 1 ? player1.name : player2.name}.`,
    );
    // Habilitar botones del nuevo jugador
    setTimeout(enableCurrentPlayerButtons, 500);
    return; // Termina el turno sin infligir daño
  }

  if (defender.isDefending) {
    damage *= 0.5;
    addLog(
      `${defender.name} se defiende y reduce el daño a ${damage.toFixed(0)}.`,
    );
    defender.isDefending = false;
  }

  defender.health -= damage;
  addLog(
    `¡${attacker.name} inflige ${damage.toFixed(0)} de daño a ${defender.name}!`,
  );

  if (defender.health <= 0) {
    defender.health = 0;
    updateHealthBars();
    endGame(attacker.name);
    return;
  }

  updateHealthBars();

  // Cambiar de turno
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  addLog(
    `Es el turno de ${currentPlayer === 1 ? player1.name : player2.name}.`,
  );

  // Habilitar botones del nuevo jugador
  setTimeout(enableCurrentPlayerButtons, 500); // Pequeño retraso para que se vea el cambio
}

// Función para manejar el turno completo, incluyendo el lanzamiento del dado
function handleTurn(action) {
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  const attacker = currentPlayer === 1 ? player1 : player2;

  // Deshabilitar todos los botones temporalmente mientras se decide el turno
  disableAllButtons();

  // Lanza el dado y muestra el resultado en el log
  diceRollDisplay.textContent = diceRoll;

  // Si el dado es 6, habilita el botón especial si no se ha usado y se le da la opción de usarlo
  if (diceRoll === 6 && !attacker.specialUsed) {
    attacker.specialButton.disabled = false;
    addLog(
      `¡El dado sacó un 6! ${attacker.name} puede usar su ataque especial.`,
      logColors[attacker.role],
    );
    // Espera a la selección del usuario
    const actionsDiv = currentPlayer === 1 ? player1Actions : player2Actions;
    actionsDiv.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", function (event) {
        // Evita múltiples listeners
        event.stopImmediatePropagation();
        const newAction = event.target.id.includes("special")
          ? "special"
          : "attack"; // Asume que solo se puede elegir especial o normal
        playerTurn(newAction, diceRoll);
        actionsDiv
          .querySelectorAll("button")
          .forEach((btn) => btn.removeEventListener("click", arguments.callee));
      });
    });
  } else {
    playerTurn(action, diceRoll);
  }
}

// Función para actualizar el contador de pociones
function updatePotionsCount() {
  player1PotionsCount.textContent = player1.potions;
  player2PotionsCount.textContent = player2.potions;
}

// Función para actualizar el icono de un jugador
function updatePlayerIcon(player, element) {
  element.src = `/${player.role}.png`;
}

// Evento para el botón de inicio (pantalla inicial)
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  characterSelectScreen.style.display = "flex";
  backgroundMusic.play();
});

// Evento para el botón de iniciar el juego (selección de personajes)
startGameButton.addEventListener("click", () => {
  const player1Name = player1NameInput.value.trim() || "Héroe 1";
  const player2Name = player2NameInput.value.trim() || "Héroe 2";
  const player1Role = player1RoleSelect.value;
  const player2Role = player2RoleSelect.value;

  // Inicializar objetos de jugadores
  player1 = {
    name: player1Name,
    role: player1Role,
    health: 100,
    potions: 3,
    specialUsed: false,
    isDefending: false,
    attackButton: document.getElementById("player1-attack-button"),
    defendButton: document.getElementById("player1-defend-button"),
    potionButton: document.getElementById("player1-potion-button"),
    specialButton: document.getElementById("player1-special-button"),
  };
  player2 = {
    name: player2Name,
    role: player2Role,
    health: 100,
    potions: 3,
    specialUsed: false,
    isDefending: false,
    attackButton: document.getElementById("player2-attack-button"),
    defendButton: document.getElementById("player2-defend-button"),
    potionButton: document.getElementById("player2-potion-button"),
    specialButton: document.getElementById("player2-special-button"),
  };

  // Configurar botones especiales por rol
  const setSpecialButton = (player) => {
    let buttonText = "";
    let className = "";
    let iconClass = "";
    switch (player.role) {
      case "guerrero":
        buttonText = "Espada Gigante de Acero";
        className = "special-guerrero";
        iconClass = "fa-solid fa-gavel";
        break;
      case "mago":
        buttonText = "Bola de Fuego Gigante";
        className = "special-mago";
        iconClass = "fa-solid fa-fire";
        break;
      case "arquero":
        buttonText = "Lluvia de Flechas Venenosas";
        className = "special-arquero";
        iconClass = "fa-solid fa-feather-pointed";
        break;
    }
    player.specialButton.textContent = "";
    const icon = document.createElement("i");
    icon.className = iconClass;
    const span = document.createElement("span");
    span.textContent = " " + buttonText;
    player.specialButton.appendChild(icon);
    player.specialButton.appendChild(span);
    player.specialButton.classList.add(className);
  };

  setSpecialButton(player1);
  setSpecialButton(player2);

  // Actualizar la interfaz del juego con los datos de los jugadores
  player1NameDisplay.textContent = player1.name;
  player1RoleDisplay.textContent =
    player1.role.charAt(0).toUpperCase() + player1.role.slice(1);
  player2NameDisplay.textContent = player2.name;
  player2RoleDisplay.textContent =
    player2.role.charAt(0).toUpperCase() + player2.role.slice(1);

  // Actualizar los íconos de los jugadores
  updatePlayerIcon(player1, player1Icon);
  updatePlayerIcon(player2, player2Icon);

  characterSelectScreen.style.display = "none";
  gameScreen.style.display = "flex";
  updateHealthBars();
  updatePotionsCount();

  // Asignar eventos a los botones de acción
  player1.attackButton.addEventListener("click", () => handleTurn("attack"));
  player1.defendButton.addEventListener("click", () => handleTurn("defend"));
  player1.potionButton.addEventListener("click", () => handleTurn("potion"));
  player1.specialButton.addEventListener("click", () => handleTurn("special"));

  player2.attackButton.addEventListener("click", () => handleTurn("attack"));
  player2.defendButton.addEventListener("click", () => handleTurn("defend"));
  player2.potionButton.addEventListener("click", () => handleTurn("potion"));
  player2.specialButton.addEventListener("click", () => handleTurn("special"));

  // El juego comienza con el jugador 1
  addLog(`¡${player1.name} y ${player2.name} se enfrentan en la mazmorra!`);
  addLog(`¡Es el turno de ${player1.name} (${player1.role})!`);
  enableCurrentPlayerButtons();
});

// Evento para silenciar/activar la música
musicToggleButton.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    musicToggleButton.innerHTML = '<i class="fas fa-volume-up"></i>';
  } else {
    backgroundMusic.pause();
    musicToggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }
});

document.addEventListener("keydown", playTypingSound);
document.addEventListener("click", playTypingSound);
