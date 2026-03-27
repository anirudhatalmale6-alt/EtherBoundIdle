/**
 * Hybrid Persistence System
 * 
 * Client-side fallback cache for when backend delays
 * Uses time-based calculations, NOT timers
 * 
 * System of record: Server (PlayerSession entity)
 * Fallback: localStorage with lastUpdateTimestamp
 */

const STORAGE_KEY_PREFIX = 'game_session_';

export const hybridPersistence = {
  /**
   * Calculate progress based on elapsed time
   * This is TIME-BASED, not timer-based
   */
  calculateProgress(lastTimestamp, baseSpeed = 1) {
    const now = Date.now();
    const lastUpdate = new Date(lastTimestamp).getTime();
    const elapsedSeconds = (now - lastUpdate) / 1000;
    
    // Speed = progress per second (0-100% range)
    // Example: speed=2 means 2 percentage points per second
    const progressGain = (elapsedSeconds * baseSpeed);
    
    return {
      elapsedSeconds,
      progressGain,
      timestamp: now,
    };
  },

  /**
   * Save local state to localStorage
   * Used as fallback when backend is slow
   */
  saveLocal(characterId, state) {
    const key = `${STORAGE_KEY_PREFIX}${characterId}`;
    const data = {
      ...state,
      lastSyncTimestamp: Date.now(),
      // Include the current time so we can calculate progress later
      syncedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  },

  /**
   * Load local state from localStorage
   * Returns null if not found
   */
  loadLocal(characterId) {
    const key = `${STORAGE_KEY_PREFIX}${characterId}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
      return null;
    }
  },

  /**
   * Clear local state (after successful sync with server)
   */
  clearLocal(characterId) {
    const key = `${STORAGE_KEY_PREFIX}${characterId}`;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
  },

  /**
   * Calculate current progress from last known state
   * Used when page reloads or returns to tab
   * 
   * Returns: { currentProgress, elapsedSeconds, reward }
   */
  resumeProgress(lastState, skillSpeed = 1) {
    if (!lastState?.lastUpdateTimestamp) return null;

    const { progressGain, elapsedSeconds } = this.calculateProgress(
      lastState.lastUpdateTimestamp,
      skillSpeed
    );

    let currentProgress = (lastState.progress || 0) + progressGain;
    let rewardsEarned = 0;

    // If progress >= 100, calculate how many rewards were earned
    while (currentProgress >= 100) {
      currentProgress -= 100;
      rewardsEarned++;
    }

    return {
      currentProgress: Math.min(100, currentProgress),
      elapsedSeconds,
      rewardsEarned,
      shouldSync: rewardsEarned > 0 || elapsedSeconds > 60, // Sync if reward or 1+ min elapsed
    };
  },

  /**
   * Store combat state locally
   * Restored on page reload
   */
  saveCombat(characterId, combatState) {
    this.saveLocal(characterId, {
      type: 'combat',
      active: true,
      combatState,
      lastUpdateTimestamp: new Date().toISOString(),
    });
  },

  /**
   * Restore combat state from local storage
   */
  loadCombat(characterId) {
    const state = this.loadLocal(characterId);
    return state?.type === 'combat' ? state : null;
  },

  /**
   * Store life skill state locally
   */
  saveLifeSkill(characterId, skillType, progress, speedLevel = 1) {
    this.saveLocal(characterId, {
      type: 'lifeskill',
      active: true,
      skillType,
      progress: Math.min(100, progress),
      speedLevel,
      lastUpdateTimestamp: new Date().toISOString(),
    });
  },

  /**
   * Restore life skill state
   */
  loadLifeSkill(characterId) {
    const state = this.loadLocal(characterId);
    return state?.type === 'lifeskill' ? state : null;
  },

  /**
   * Store gem lab state locally
   */
  saveGemLab(characterId, lastCollectionTime, pendingGems = 0) {
    this.saveLocal(characterId, {
      type: 'gemlab',
      active: true,
      lastCollectionTime,
      pendingGems,
      lastUpdateTimestamp: new Date().toISOString(),
    });
  },

  /**
   * Restore gem lab state
   */
  loadGemLab(characterId) {
    const state = this.loadLocal(characterId);
    return state?.type === 'gemlab' ? state : null;
  },

  /**
   * Calculate gem generation based on time
   * Used when game resumes from offline/reload
   * 
   * Formula: gemsPerSecond = (baseRate * speedLevel * efficiencyLevel) / 60
   */
  calculateGemGeneration(
    elapsedSeconds,
    baseRate = 1,
    speedLevel = 0,
    efficiencyLevel = 0
  ) {
    const speedMultiplier = 1 + (speedLevel * 0.1); // Each level = +10%
    const efficiencyMultiplier = 1 + (efficiencyLevel * 0.15); // Each level = +15%
    
    const gemsPerSecond = (baseRate * speedMultiplier * efficiencyMultiplier) / 60;
    const totalGemsGenerated = Math.floor(elapsedSeconds * gemsPerSecond);
    
    return {
      gemsGenerated: totalGemsGenerated,
      gemsPerSecond,
      elapsedSeconds,
    };
  },
};

export default hybridPersistence;