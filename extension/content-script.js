/**
 * Content script pour afficher une notification overlay
 * sur les pages de recettes supportées
 */

(function () {
  // Éviter les injections multiples
  if (window.__reciperInjected) return;
  window.__reciperInjected = true;

  const NOTIFICATION_ID = "reciper-notification";

  /**
   * Crée et injecte les styles CSS
   */
  function injectStyles() {
    if (document.getElementById("reciper-styles")) return;

    const styles = document.createElement("style");
    styles.id = "reciper-styles";
    styles.textContent = `
      #${NOTIFICATION_ID} {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483647;
        overflow: hidden;
        animation: reciper-slide-in 0.3s ease-out;
      }

      @keyframes reciper-slide-in {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes reciper-slide-out {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }

      #${NOTIFICATION_ID}.closing {
        animation: reciper-slide-out 0.2s ease-in forwards;
      }

      #${NOTIFICATION_ID} .reciper-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        color: white;
      }

      #${NOTIFICATION_ID} .reciper-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      #${NOTIFICATION_ID} .reciper-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      #${NOTIFICATION_ID} .reciper-close:hover {
        opacity: 1;
      }

      #${NOTIFICATION_ID} .reciper-body {
        padding: 16px;
      }

      #${NOTIFICATION_ID} .reciper-status {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #333;
      }

      #${NOTIFICATION_ID} .reciper-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #ff6b35;
        border-radius: 50%;
        animation: reciper-spin 1s linear infinite;
      }

      @keyframes reciper-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      #${NOTIFICATION_ID} .reciper-success {
        color: #28a745;
      }

      #${NOTIFICATION_ID} .reciper-error {
        color: #dc3545;
      }

      #${NOTIFICATION_ID} .reciper-link {
        display: inline-block;
        margin-top: 12px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        color: white;
        text-decoration: none;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      #${NOTIFICATION_ID} .reciper-link:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
      }

      #${NOTIFICATION_ID} .reciper-icon {
        font-size: 18px;
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Crée la notification
   */
  function createNotification() {
    // Supprimer l'ancienne si elle existe
    const existing = document.getElementById(NOTIFICATION_ID);
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.id = NOTIFICATION_ID;
    notification.innerHTML = `
      <div class="reciper-header">
        <span class="reciper-title">
          <span>🍳</span>
          <span>Reciper</span>
        </span>
        <button class="reciper-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="reciper-body">
        <div class="reciper-status">
          <div class="reciper-spinner"></div>
          <span>Récupération de la recette...</span>
        </div>
      </div>
    `;

    // Gestionnaire de fermeture
    notification.querySelector(".reciper-close").addEventListener("click", () => {
      closeNotification();
    });

    document.body.appendChild(notification);
    return notification;
  }

  /**
   * Ferme la notification avec animation
   */
  function closeNotification() {
    const notification = document.getElementById(NOTIFICATION_ID);
    if (!notification) return;

    notification.classList.add("closing");
    setTimeout(() => {
      notification.remove();
    }, 200);
  }

  /**
   * Met à jour la notification en cas de succès
   */
  function showSuccess(recipeId, extensionUrl) {
    const notification = document.getElementById(NOTIFICATION_ID);
    if (!notification) return;

    const body = notification.querySelector(".reciper-body");
    body.innerHTML = `
      <div class="reciper-status reciper-success">
        <span class="reciper-icon">✓</span>
        <span>Recette enregistrée !</span>
      </div>
      <button class="reciper-link" id="reciper-view-btn">
        Voir sur Reciper →
      </button>
    `;

    // Le lien chrome-extension:// ne fonctionne pas en direct depuis content script
    // On demande au service worker d'ouvrir la page
    document.getElementById("reciper-view-btn").addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: "OPEN_RECIPE",
        recipeId,
      });
      closeNotification();
    });
  }

  /**
   * Met à jour la notification en cas d'erreur
   */
  function showError(message) {
    const notification = document.getElementById(NOTIFICATION_ID);
    if (!notification) return;

    const body = notification.querySelector(".reciper-body");
    body.innerHTML = `
      <div class="reciper-status reciper-error">
        <span class="reciper-icon">✗</span>
        <span>${message || "Erreur lors de la récupération"}</span>
      </div>
    `;
  }

  /**
   * Écoute les messages du service worker
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "RECIPER_SHOW_LOADING") {
      injectStyles();
      createNotification();
      sendResponse({ success: true });
    }

    if (message.type === "RECIPER_SHOW_SUCCESS") {
      showSuccess(message.recipeId, message.extensionUrl);
      sendResponse({ success: true });
    }

    if (message.type === "RECIPER_SHOW_ERROR") {
      showError(message.error);
      sendResponse({ success: true });
    }

    return true;
  });
})();
