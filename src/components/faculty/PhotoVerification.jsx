import React, { useState } from 'react';
import { Camera, CheckCircle, XCircle, Eye, Calendar, Users, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

// Mock photo data
const MOCK_PHOTOS = [
  {
    id: '1',
    studentName: 'Aarav Sharma',
    regNumber: 'BCA22001',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    timestamp: new Date('2024-01-15T10:30:00'),
    subject: 'JAVA',
    status: 'pending'
  },
  {
    id: '2', 
    studentName: 'Diya Patel',
    regNumber: 'BCA22002',
    photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616c7c65c35?w=150&h=150&fit=crop&crop=face',
    timestamp: new Date('2024-01-15T10:32:00'),
    subject: 'JAVA',
    status: 'pending'
  },
  {
    id: '3',
    studentName: 'Arjun Kumar', 
    regNumber: 'BCA22003',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    timestamp: new Date('2024-01-15T10:35:00'),
    subject: 'JAVA',
    status: 'approved'
  }
];

const PhotoVerification = () => {
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const handlePhotoAction = (photoId, action) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, status: action }
        : photo
    ));
    
    if (showModal) {
      setShowModal(false);
      setSelectedPhoto(null);
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const filteredPhotos = photos.filter(photo => {
    if (filter === 'all') return true;
    return photo.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const pendingCount = photos.filter(p => p.status === 'pending').length;
  const approvedCount = photos.filter(p => p.status === 'approved').length;
  const rejectedCount = photos.filter(p => p.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{photos.length}</p>
              <p className="text-sm text-gray-600">Total Photos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Student Photos</h3>
          
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Photos' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' }, 
              { key: 'rejected', label: 'Rejected' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">
              No Photos Found
            </h4>
            <p className="text-gray-400 text-sm">
              No photos match the current filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  {getStatusIcon(photo.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(photo.status)}`}>
                    {photo.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={photo.photoUrl}
                    alt={photo.studentName}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openPhotoModal(photo)}
                  />
                </div>
                
                <div className="space-y-1 mb-4">
                  <h4 className="font-medium text-gray-900">{photo.studentName}</h4>
                  <p className="text-sm text-gray-600">{photo.regNumber}</p>
                  <p className="text-xs text-gray-500">
                    {photo.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-blue-600">{photo.subject}</p>
                </div>
                
                {photo.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePhotoAction(photo.id, 'approved')}
                      variant="success"
                      size="sm"
                      className="flex-1"
                      icon={<CheckCircle className="w-3 h-3" />}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handlePhotoAction(photo.id, 'rejected')}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      icon={<XCircle className="w-3 h-3" />}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Photo Verification"
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={selectedPhoto.photoUrl}
                alt={selectedPhoto.studentName}
                className="max-w-full max-h-96 rounded-lg shadow-lg"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Student:</strong> {selectedPhoto.studentName}</div>
                <div><strong>Reg No:</strong> {selectedPhoto.regNumber}</div>
                <div><strong>Subject:</strong> {selectedPhoto.subject}</div>
                <div><strong>Time:</strong> {selectedPhoto.timestamp.toLocaleString()}</div>
              </div>
            </div>
            
            {selectedPhoto.status === 'pending' && (
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => handlePhotoAction(selectedPhoto.id, 'approved')}
                  variant="success"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handlePhotoAction(selectedPhoto.id, 'rejected')}
                  variant="danger"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoVerification;