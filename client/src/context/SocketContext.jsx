import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [stockUpdates, setStockUpdates] = useState([]);

  useEffect(() => {
    const s = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    setSocket(s);

    s.on('emergency-request', (data) => {
      setEmergencyAlerts(prev => [data, ...prev].slice(0, 10));
    });

    s.on('stock-update', (data) => {
      setStockUpdates(prev => [data, ...prev].slice(0, 20));
    });

    return () => s.disconnect();
  }, []);

  const joinCity = (city) => {
    if (socket && city) socket.emit('join-city', city);
  };

  const dismissAlert = (index) => {
    setEmergencyAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SocketContext.Provider value={{ socket, emergencyAlerts, stockUpdates, joinCity, dismissAlert }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
