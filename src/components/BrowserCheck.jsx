// src/components/BrowserCheck.jsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const BrowserCheck = ({ children }) => {
  const [compatibility, setCompatibility] = useState({
    webgl: false,
    speech: false,
    getUserMedia: false,
    threejs: false,
    checking: true
  });

  useEffect(() => {
    const checkCompatibility = async () => {
      const checks = {
        webgl: checkWebGL(),
        speech: checkSpeechSynthesis(),
        getUserMedia: checkGetUserMedia(),
        threejs: await checkThreeJS(),
        checking: false
      };
      
      setCompatibility(checks);
      console.log('🔍 Browser compatibility:', checks);
    };

    checkCompatibility();
  }, []);

  const checkWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  const checkSpeechSynthesis = () => {
    return 'speechSynthesis' in window;
  };

  const checkGetUserMedia = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  const checkThreeJS = async () => {
    try {
      // This will be true if THREE is available globally
      return typeof THREE !== 'undefined';
    } catch (e) {
      return false;
    }
  };

  if (compatibility.checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Checking Browser Compatibility...</h2>
        </div>
      </div>
    );
  }

  const allCompatible = compatibility.webgl && compatibility.speech && compatibility.getUserMedia;

  if (!allCompatible) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Browser Compatibility Check</h2>
            <p className="text-gray-300">Some features may not work properly</p>
          </div>
          
          <div className="space-y-3">
            {Object.entries({
              webgl: 'WebGL (3D Graphics)',
              speech: 'Speech Synthesis (Voice)',
              getUserMedia: 'Camera Access',
              threejs: 'Three.js Library'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                {compatibility[key] ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`${compatibility[key] ? 'text-green-400' : 'text-red-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mr-3"
            >
              Retry
            </button>
            <button
              onClick={() => setCompatibility(prev => ({ ...prev, webgl: true, speech: true, getUserMedia: true }))}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Continue Anyway
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-400 text-center">
            For best experience, use Chrome, Firefox, or Safari
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default BrowserCheck;