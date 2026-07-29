import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const MultiplayerContext = createContext(null);

export const useMultiplayer = () => {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayer must be inside MultiplayerProvider');
  return ctx;
};

export const MultiplayerProvider = ({ children }) => {
  const [role, setRole] = useState(null);           // 'host' | 'guest' | null
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isWaiting, setIsWaiting] = useState(false);  // host waiting for guest
  // host = woman, guest = man
  const [localPlayer, setLocalPlayer] = useState(null); // 'woman' | 'man'

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const dataHandlersRef = useRef([]);  // list of { type, handler } to call on incoming data

  const destroyPeer = useCallback(() => {
    if (connRef.current) {
      try { connRef.current.close(); } catch (_) {}
      connRef.current = null;
    }
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (_) {}
      peerRef.current = null;
    }
    setIsConnected(false);
    setIsWaiting(false);
  }, []);

  // Register a handler for incoming data messages
  const onData = useCallback((handler) => {
    dataHandlersRef.current.push(handler);
    return () => {
      dataHandlersRef.current = dataHandlersRef.current.filter(h => h !== handler);
    };
  }, []);

  const handleIncomingData = useCallback((data) => {
    dataHandlersRef.current.forEach(h => h(data));
  }, []);

  const setupConnection = useCallback((conn) => {
    connRef.current = conn;
    conn.on('data', handleIncomingData);
    conn.on('open', () => {
      setIsConnected(true);
      setIsWaiting(false);
      setConnectionError(null);
    });
    conn.on('close', () => {
      setIsConnected(false);
    });
    conn.on('error', (err) => {
      setConnectionError(err.message || 'Bağlantı hatası');
    });
  }, [handleIncomingData]);

  // PeerJS sunucu ayarları - internet üzerinden (Ankara-İzmir gibi) çalışması için
  const getPeerConfig = () => ({
    debug: 0,
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
      ],
    },
  });

  // HOST: create room
  const createRoom = useCallback((code) => {
    destroyPeer();
    setConnectionError(null);
    const peer = new window.Peer(code, getPeerConfig());
    peerRef.current = peer;
    setRoomCode(code);
    setRole('host');
    setLocalPlayer('woman');
    setIsWaiting(true);

    peer.on('open', () => {
      // Waiting for guest
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      setConnectionError(err.message || 'Oda oluşturulamadı');
      setIsWaiting(false);
    });
  }, [destroyPeer, setupConnection]);

  // GUEST: join room
  const joinRoom = useCallback((code) => {
    destroyPeer();
    setConnectionError(null);
    // Guest uses a different peer id to avoid collision
    const guestId = code + '_guest_' + Math.floor(Math.random() * 9000 + 1000);
    const peer = new window.Peer(guestId, getPeerConfig());
    peerRef.current = peer;
    setRoomCode(code);
    setRole('guest');
    setLocalPlayer('man');

    peer.on('open', () => {
      const conn = peer.connect(code);
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      setConnectionError(err.message || 'Odaya katılınamadı. Kodu kontrol edin.');
    });
  }, [destroyPeer, setupConnection]);

  // Send data to peer
  const sendData = useCallback((payload) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(payload);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyPeer();
  }, [destroyPeer]);

  const reset = useCallback(() => {
    destroyPeer();
    setRole(null);
    setRoomCode('');
    setLocalPlayer(null);
    setConnectionError(null);
  }, [destroyPeer]);

  return (
    <MultiplayerContext.Provider value={{
      role, roomCode, isConnected, isWaiting, localPlayer,
      connectionError, setConnectionError,
      createRoom, joinRoom, sendData, onData, reset,
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};
