// hooks/useFreighter.ts - Using official @stellar/freighter-api

import { useState, useEffect, useCallback } from 'react';
import { isConnected, getAddress, requestAccess } from '@stellar/freighter-api';

export function useFreighter() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Freighter is installed and available
  const checkFreighterAvailability = useCallback(async () => {
    try {
      console.log('Checking Freighter availability...');
      const result = await isConnected();
      const available = result.isConnected;
      
      console.log('Freighter check result:', {
        isConnected: result.isConnected,
        available,
        timestamp: new Date().toISOString()
      });
      
      setIsAvailable(available);
      return available;
    } catch (err) {
      console.error('Freighter check error:', err);
      setIsAvailable(false);
      return false;
    }
  }, []);

  // Initial and recurrent checks for extension load
  useEffect(() => {
    // We run multiple checks because extensions load asynchronously.
    const checks = [
      setTimeout(checkFreighterAvailability, 0),
      setTimeout(checkFreighterAvailability, 500),
      setTimeout(checkFreighterAvailability, 1500),
      setTimeout(checkFreighterAvailability, 3000),
    ];
    
    return () => checks.forEach(t => clearTimeout(t));
  }, [checkFreighterAvailability]);

  // Connect to Freighter wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('Requesting Freighter access...');
      
      // Step 1: Request access (prompts user for permission)
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        throw new Error(accessResult.error);
      }
      
      console.log('Access granted, getting address...');
      
      // Step 2: Get the user's address
      const addressResult = await getAddress();
      
      if (addressResult.error) {
        throw new Error(addressResult.error);
      }
      
      setPublicKey(addressResult.address);
      console.log('✅ Successfully connected to Freighter:', addressResult.address);
    } catch (err: any) {
      console.error('❌ Freighter connection error:', err);
      
      // Provide user-friendly error messages
      const message = err?.message?.includes('User declined') || err?.message?.includes('denied')
        ? 'Connection request was declined in Freighter wallet.'
        : err?.message || 'Failed to connect wallet. Please ensure Freighter is unlocked and try again.';
        
      setError(message);
      setPublicKey(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setError(null);
    console.log('Freighter disconnected.');
  }, []);

  return {
    publicKey,
    isAvailable,
    isConnected: !!publicKey,
    isConnecting,
    error,
    connect,
    disconnect,
    checkFreighter: checkFreighterAvailability, // Expose manual check function
  };
}