import React, { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { academicDataService } from '../../services/firebase';

const DataInitializer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState(null);

  const initializeData = async () => {
    setIsInitializing(true);
    setResult(null);

    try {
      const response = await academicDataService.initializeAcademicData();
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <Database className="w-8 h-8 text-purple-600" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Initialize Academic Data
          </h3>
          <p className="text-gray-600 text-sm">
            Set up schools, batches, and subjects in Firebase
          </p>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </span>
            </div>
            <p className={`text-sm mt-2 ${
              result.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.message || result.error}
            </p>
          </div>
        )}

        <button
          onClick={initializeData}
          disabled={isInitializing}
          className="btn-primary py-3 px-6 disabled:opacity-50"
        >
          {isInitializing ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Database className="w-5 h-5 mr-2" />
              Initialize Data
            </>
          )}
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>This will create:</p>
          <ul className="text-left space-y-1">
            <li>• School of Technology (SOT)</li>
            <li>• School of Management (SOM)</li>
            <li>• Batches: sot24b1, sot24b2, sot23b1, som23b1, som24b1</li>
            <li>• SOT subjects: Java, Python, Database, JavaScript, SQL</li>
            <li>• SOM subjects: Economics, Python for Business</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataInitializer;