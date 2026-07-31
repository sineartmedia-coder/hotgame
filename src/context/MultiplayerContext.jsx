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
  const [localPlayer, setLocalPlayer] = useState(null); // 'woman' | 'man' - oyuncu kendisi seçiyor
  const [remotePlayerGender, setRemotePlayerGender] = useState(null); // karşı oyuncunun seçimi

  // Sesli sohbet state'leri
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const dataHandlersRef = useRef([]);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);

  const destroyPeer = useCallback(() => {
    if (currentCallRef.current) {
      try { currentCallRef.current.close(); } catch (_) {}
      currentCallRef.current = null;
    }
    if (connRef.current) {
      try { connRef.current.close(); } catch (_) {}
      connRef.current = null;
    }
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch (_) {}
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
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
    // Karşı oyuncunun karakter seçimini yakala
    if (data.type === 'characterChosen') {
      setRemotePlayerGender(data.gender);
    }
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

  // Ses izni alma fonksiyonu
  const initAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      // Varsayılan olarak açık gelsin
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setIsMuted(!audioTrack.enabled);
      }
      return stream;
    } catch (err) {
      console.warn("Mikrofon izni alınamadı veya mikrofon yok:", err);
      return null;
    }
  }, []);

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
  const createRoom = useCallback(async (code) => {
    destroyPeer();
    setConnectionError(null);
    setLocalPlayer(null);        // sıfırla - seçim ekranında seçilecek
    setRemotePlayerGender(null);
    
    // Odayı kurmadan önce mikrofon izni iste
    await initAudio();

    const peer = new window.Peer(code, getPeerConfig());
    peerRef.current = peer;
    setRoomCode(code);
    setRole('host');
    setIsWaiting(true);

    peer.on('open', () => {
      // Waiting for guest
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    // Gelen sesli aramaları dinle
    peer.on('call', (call) => {
      call.answer(localStreamRef.current);
      currentCallRef.current = call;
      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });
    });

    peer.on('error', (err) => {
      setConnectionError(err.message || 'Oda oluşturulamadı');
      setIsWaiting(false);
    });
  }, [destroyPeer, setupConnection, initAudio]);

  // GUEST: join room
  const joinRoom = useCallback(async (code) => {
    destroyPeer();
    setConnectionError(null);
    setLocalPlayer(null);        // sıfırla - seçim ekranında seçilecek
    setRemotePlayerGender(null);
    
    // Odaya girmeden önce mikrofon izni iste
    await initAudio();

    const guestId = code + '_guest_' + Math.floor(Math.random() * 9000 + 1000);
    const peer = new window.Peer(guestId, getPeerConfig());
    peerRef.current = peer;
    setRoomCode(code);
    setRole('guest');

    peer.on('open', () => {
      const conn = peer.connect(code);
      setupConnection(conn);

      // Bağlantı açılınca host'u ara (ses aktarımı için)
      if (localStreamRef.current) {
        const call = peer.call(code, localStreamRef.current);
        currentCallRef.current = call;
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      }
    });

    // İhtimal dahilinde host ararsa
    peer.on('call', (call) => {
      call.answer(localStreamRef.current);
      currentCallRef.current = call;
      call.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });
    });

    peer.on('error', (err) => {
      setConnectionError(err.message || 'Odaya katılınamadı. Kodu kontrol edin.');
    });
  }, [destroyPeer, setupConnection, initAudio]);

  // Mikrofonu Aç/Kapat
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Oyuncu kendi karakterini seçiyor ve karşı tarafa bildiriyor
  const chooseCharacter = useCallback((gender) => {
    setLocalPlayer(gender);
    // Karşı oyuncuya seçimini bildir
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'characterChosen', gender });
    }
  }, []);

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
    setRemotePlayerGender(null);
    setConnectionError(null);
  }, [destroyPeer]);

  return (
    <MultiplayerContext.Provider value={{
      role, roomCode, isConnected, isWaiting, localPlayer, remotePlayerGender,
      connectionError, setConnectionError,
      createRoom, joinRoom, sendData, onData, reset, chooseCharacter,
      localStream, remoteStream, isMuted, toggleMute
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};
