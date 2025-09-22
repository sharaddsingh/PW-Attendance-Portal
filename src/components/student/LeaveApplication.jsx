import React, { useState, useEffect } from 'react';
import { FileText, Upload, Send, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useNotify } from '../../contexts/NotificationContext';
import { addDoc, collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, uploadFile } from '../../services/firebase';

const SUBJECTS = [
  'JAVA',
  'DSA', 
  'DBMS',
  'PYTHON',
  'JAVASCRIPT',
  'EXCEL',
  'BUSINESS COMMUNICATION',
  'CRITICAL COMMUNICATION'
];

const LeaveApplication = () => {
  const [formData, setFormData] = useState({
    date: '',
    periods: '',
    subject: '',
    reason: '',
    attachment: null
  });
  const [loading, setLoading] = useState(false);
  const [fetchingApplications, setFetchingApplications] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const { user, userProfile } = useAuth();
  const notify = useNotify();

  // Fetch recent leave applications
  useEffect(() => {
    fetchRecentApplications();
  }, [user]);

  const fetchRecentApplications = async () => {
    if (!user) return;
    
    try {
      setFetchingApplications(true);
      const applicationsRef = collection(db, 'leave_applications');
      const q = query(
        applicationsRef,
        where('studentId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const applications = [];
      
      snapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      setRecentApplications(applications.slice(0, 5)); // Show only 5 recent applications
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      notify.error('Failed to fetch recent applications');
    } finally {
      setFetchingApplications(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notify.error('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        notify.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setAttachmentPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.periods || !formData.subject || !formData.reason) {
      notify.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);

    try {
      let attachmentUrl = null;
      
      // Upload attachment if provided
      if (formData.attachment) {
        const attachmentPath = `leave_attachments/${user.uid}/${Date.now()}_${formData.attachment.name}`;
        const uploadResult = await uploadFile(formData.attachment, attachmentPath);
        
        if (uploadResult.success) {
          attachmentUrl = uploadResult.url;
        } else {
          throw new Error('Failed to upload attachment');
        }
      }
      
      // Create leave application document
      const applicationData = {
        studentId: user.uid,
        studentName: userProfile.fullName,
        studentEmail: user.email,
        regNumber: userProfile.regNumber,
        batch: userProfile.batch,
        school: userProfile.school,
        date: formData.date,
        periods: parseInt(formData.periods),
        subject: formData.subject,
        reason: formData.reason,
        attachmentUrl: attachmentUrl,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        facultyRemarks: null,
        reviewedBy: null,
        reviewedAt: null
      };
      
      await addDoc(collection(db, 'leave_applications'), applicationData);
      
      // Reset form
      setFormData({
        date: '',
        periods: '',
        subject: '',
        reason: '',
        attachment: null
      });
      setAttachmentPreview(null);
      
      notify.success('Leave application submitted successfully!');
      
      // Refresh recent applications
      await fetchRecentApplications();
      
    } catch (error) {
      console.error('Error submitting leave application:', error);
      notify.error('Failed to submit leave application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
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

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Leave Requests
          </h3>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(app.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {app.subject} - {app.periods} period(s)
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(app.date).toLocaleDateString()} • {app.reason}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                  {app.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave Application Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Date */}
            <Input
              label="Leave Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={today}
            />

            {/* Number of Periods */}
            <Input
              label="Number of Classes"
              name="periods"
              type="number"
              value={formData.periods}
              onChange={handleInputChange}
              required
              min="1"
              max="8"
              placeholder="Enter number of classes"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Subject</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Please provide a detailed reason for your leave request"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Document (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Choose File</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                />
              </label>
              {formData.attachment && (
                <span className="text-sm text-gray-600">
                  {formData.attachment.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (max 5MB)
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.date || !formData.periods || !formData.subject || !formData.reason}
              variant="primary"
              className="w-full sm:w-auto"
              icon={<Send className="w-4 h-4" />}
            >
              Submit Leave Application
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Leave applications must be submitted at least 24 hours in advance</li>
            <li>• Medical leaves require proper documentation</li>
            <li>• Faculty approval is required for all leave requests</li>
            <li>• Emergency leaves can be applied on the same day with valid reasons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;