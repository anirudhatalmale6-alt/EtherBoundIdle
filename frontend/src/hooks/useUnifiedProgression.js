import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * UNIFIED PROGRESSION HOOK
 * 
 * Handles:
 * - Syncing with backend every X seconds
 * - Displaying current state
 * - Sending actions (start skill, attack, etc.)
 * 
 * Frontend ONLY displays and sends actions.
 * Backend calculates EVERYTHING.
 */

export function useUnifiedProgression(characterId, enabled = true) {
  const [character, setCharacter] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const syncTimerRef = useRef(null);

  // Sync with backend every 5 seconds
  const syncState = async () => {
    if (!characterId) return;

    try {
      setIsLoading(true);
      const response = await base44.functions.invoke('unifiedPlayerProgression', {
        characterId,
        action: 'sync_state',
      });

      if (response.data?.success) {
        setCharacter(response.data.character);
        setSession(response.data.session);
        setError(null);
      } else {
        setError(response.data?.error || 'Sync failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial sync and setup interval
  useEffect(() => {
    if (!enabled || !characterId) return;

    syncState();
    syncTimerRef.current = setInterval(syncState, 5000); // Sync every 5 seconds

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [characterId, enabled]);

  // Action: Start a skill
  const startSkill = async (skillType) => {
    if (!characterId) return;

    try {
      const response = await base44.functions.invoke('unifiedPlayerProgression', {
        characterId,
        action: 'start_skill',
        payload: { skill_type: skillType },
      });

      if (response.data?.success) {
        setSession(response.data.session);
        return { success: true };
      }
      return { success: false, error: response.data?.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Action: Stop skill
  const stopSkill = async () => {
    if (!characterId) return;

    try {
      const response = await base44.functions.invoke('unifiedPlayerProgression', {
        characterId,
        action: 'stop_skill',
      });

      if (response.data?.success) {
        setSession(response.data.session);
        return { success: true };
      }
      return { success: false, error: response.data?.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Action: Attack in combat
  const attack = async (damage = 10) => {
    if (!characterId) return;

    try {
      const response = await base44.functions.invoke('unifiedPlayerProgression', {
        characterId,
        action: 'attack',
        payload: { damage },
      });

      if (response.data?.success) {
        setSession(response.data.session);
        return {
          success: true,
          damage: response.data.damage,
          enemyHp: response.data.enemyHp,
          isDead: response.data.isDead,
        };
      }
      return { success: false, error: response.data?.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Manual sync (for when user needs immediate update)
  const manualSync = () => syncState();

  return {
    character,
    session,
    isLoading,
    error,
    actions: {
      startSkill,
      stopSkill,
      attack,
      sync: manualSync,
    },
  };
}