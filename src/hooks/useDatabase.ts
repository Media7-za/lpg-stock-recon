import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import type { ERPSnapshot, PhysicalCountSession, MovementData } from '../types';

export function useERPSnapshots() {
  const [snapshots, setSnapshots] = useState<ERPSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      const all = await db.erpSnapshots.orderBy('timestamp').reverse().toArray();
      setSnapshots(all);
    } catch (error) {
      console.error('Error loading ERP snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSnapshot = async (snapshot: Omit<ERPSnapshot, 'id'>) => {
    const id = crypto.randomUUID();
    const newSnapshot: ERPSnapshot = {
      ...snapshot,
      id,
      timestamp: new Date(),
    };
    await db.erpSnapshots.add(newSnapshot);
    await loadSnapshots();
    return id;
  };

  const getSnapshot = async (id: string): Promise<ERPSnapshot | undefined> => {
    return await db.erpSnapshots.get(id);
  };

  return { snapshots, loading, addSnapshot, getSnapshot, refresh: loadSnapshots };
}

export function usePhysicalCountSessions() {
  const [sessions, setSessions] = useState<PhysicalCountSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const all = await db.physicalCounts.orderBy('timestamp').reverse().toArray();
      setSessions(all);
    } catch (error) {
      console.error('Error loading physical count sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (session: Omit<PhysicalCountSession, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const newSession: PhysicalCountSession = {
      ...session,
      id,
      timestamp: new Date(),
    };
    await db.physicalCounts.add(newSession);
    await loadSessions();
    return id;
  };

  const updateSession = async (id: string, updates: Partial<PhysicalCountSession>) => {
    await db.physicalCounts.update(id, updates);
    await loadSessions();
  };

  const getSession = async (id: string): Promise<PhysicalCountSession | undefined> => {
    return await db.physicalCounts.get(id);
  };

  const deleteSession = async (id: string) => {
    await db.physicalCounts.delete(id);
    await loadSessions();
  };

  return {
    sessions,
    loading,
    addSession,
    updateSession,
    getSession,
    deleteSession,
    refresh: loadSessions,
  };
}

export function useMovementData() {
  const [movements, setMovements] = useState<MovementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const all = await db.movementData.orderBy('timestamp').reverse().toArray();
      setMovements(all);
    } catch (error) {
      console.error('Error loading movement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMovement = async (movement: Omit<MovementData, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const newMovement: MovementData = {
      ...movement,
      id,
      timestamp: new Date(),
    };
    await db.movementData.add(newMovement);
    await loadMovements();
    return id;
  };

  const getMovement = async (id: string): Promise<MovementData | undefined> => {
    return await db.movementData.get(id);
  };

  const deleteMovement = async (id: string) => {
    await db.movementData.delete(id);
    await loadMovements();
  };

  return {
    movements,
    loading,
    addMovement,
    getMovement,
    deleteMovement,
    refresh: loadMovements,
  };
}

