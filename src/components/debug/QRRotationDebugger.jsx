import React, { useState, useEffect, useRef } from 'react';

const QRRotationDebugger = () => {
  const [isActive, setIsActive] = useState(false);
  const [rotationTimer, setRotationTimer] = useState(5);
  const [totalRotations, setTotalRotations] = useState(0);
  const [logs, setLogs] = useState([]);
  const timerRef = useRef(null);

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }].slice(-20)); // Keep last 20 logs
  };

  // Rotation effect - exact same logic as in the main component
  useEffect(() => {
    if (isActive) {
      addLog('🔄 Starting QR rotation timer', 'success');
      
      timerRef.current = setInterval(async () => {
        setRotationTimer(prev => {
          addLog(`🕔 QR timer countdown: ${prev}`, 'info');
          
          if (prev <= 1) {
            // Time to rotate!
            addLog('🔄 Time to rotate QR code!', 'success');
            
            setTotalRotations(current => {
              const newRotationCount = current + 1;
              addLog(`🔢 Rotation count: ${newRotationCount}`, 'info');
              return newRotationCount;
            });
            
            return 5; // Reset to 5 seconds
          } else {
            return prev - 1; // Countdown
          }
        });
      }, 1000);

      return () => {
        addLog('🗑️ Cleaning up QR rotation timer', 'warning');
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isActive]);

  const startRotation = () => {
    setIsActive(true);
    setRotationTimer(5);
    setTotalRotations(0);
    addLog('▶️ Starting rotation test', 'success');
  };

  const stopRotation = () => {
    setIsActive(false);
    addLog('⏹️ Stopping rotation test', 'warning');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔄 QR Rotation Debugger</h2>
      
      {/* Control Panel */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center justify-center mb-4">
          <button
            onClick={startRotation}
            disabled={isActive}
            className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
          >
            Start Rotation
          </button>
          <button
            onClick={stopRotation}
            disabled={!isActive}
            className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
          >
            Stop Rotation
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Clear Logs
          </button>
        </div>
        
        {/* Status Display */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-3">
            <div className="text-sm text-gray-600">Status</div>
            <div className={`text-lg font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? '🟢 Active' : '🔴 Inactive'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-sm text-gray-600">Next Rotation</div>
            <div className={`text-lg font-bold ${rotationTimer <= 2 ? 'text-red-600' : 'text-blue-600'}`}>
              {rotationTimer}s
            </div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-sm text-gray-600">Total Rotations</div>
            <div className="text-lg font-bold text-green-600">
              {totalRotations}
            </div>
          </div>
        </div>
      </div>

      {/* Log Display */}
      <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
        <div className="text-white mb-2">📋 Debug Logs:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'warning' ? 'text-yellow-400' : 
              log.type === 'error' ? 'text-red-400' : 'text-blue-400'
            }`}>
              [{log.timestamp}] {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QRRotationDebugger;