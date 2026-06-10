import React, { useEffect, useState } from 'react';
import SidebarHost from '../components/SidebarHost';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const LandlordDocuments = () => {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    fileName: '',
    documentType: 'LeaseAgreement',
    propertyId: '',
    status: 'Unsigned',
    fileUrl: ''
  });

  const fetchDocuments = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/documents/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load documents');
      const data = await res.json();
      setDocuments(data);

      // Fetch properties for dropdown
      const propRes = await fetch(`${API_BASE_URL}/api/users/${user._id}/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperties(propData);
      }
    } catch (err) {
      setError(err.message || 'Error loading documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedFileName('');
    setFileError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFileName('');
    setFileError('');
    setFormData({
      fileName: '',
      documentType: 'LeaseAgreement',
      propertyId: '',
      status: 'Unsigned',
      fileUrl: ''
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setFileError('File size exceeds 8MB limit. Please choose a smaller file.');
      return;
    }

    setFileError('');
    setSelectedFileName(file.name);

    // Autofill Document Name if empty
    if (!formData.fileName) {
      const baseName = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setFormData(prev => ({ ...prev, fileName: baseName }));
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData(prev => ({ ...prev, fileUrl: uploadEvent.target.result }));
    };
    reader.onerror = () => {
      setFileError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fileName || !formData.fileUrl) {
      setError('Please fill in all fields and upload a file');
      return;
    }
    setSubmitLoading(true);
    setError('');

    const payload = {
      hostId: user._id,
      fileName: formData.fileName,
      documentType: formData.documentType,
      status: formData.status,
      fileUrl: formData.fileUrl,
      propertyId: formData.propertyId || undefined
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload document');
      }

      handleCloseModal();
      // Refresh list
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Error uploading document');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document from the vault?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete document');
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Error deleting document');
    }
  };

  const handleViewDocument = (doc) => {
    if (!doc.fileUrl) return;
    if (doc.fileUrl.startsWith('data:')) {
      try {
        const parts = doc.fileUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      } catch (err) {
        console.error('Failed to open base64 document:', err);
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
      }
    } else {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const handleDownloadDocument = (doc) => {
    if (!doc.fileUrl) return;
    if (doc.fileUrl.startsWith('data:')) {
      try {
        const parts = doc.fileUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const fileURL = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = fileURL;
        let filename = doc.fileName || 'document';
        if (!filename.includes('.')) {
          const ext = mime.split('/')[1] || 'pdf';
          filename = `${filename}.${ext}`;
        }
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to download base64 document:', err);
      }
    } else {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.target = '_blank';
      link.download = doc.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDocTypeIcon = (type) => {
    switch (type) {
      case 'LeaseAgreement': return 'history_edu';
      case 'Insurance': return 'shield';
      case 'PropertyDeed': return 'gavel';
      case 'TaxDocument': return 'percent';
      default: return 'description';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Signed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Unsigned': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-red-500/10 text-red-400 border border-red-500/20';
    }
  };

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100">
      <SidebarHost />
      
      <main className="ml-64 p-8 md:p-12 w-full space-y-12 pb-32">
        <header className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              Legal Vault
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">Documents</h1>
            <p className="text-slate-400 mt-1">Manage lease agreements, deeds, insurance, and tax records securely.</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-emerald-600/15"
          >
            <span className="material-symbols-outlined">upload</span> 
            Upload Agreement
          </button>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            <h3 className="text-2xl font-black text-white mb-2">Encrypted Vault Storage</h3>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Your legal agreements and title deeds are encrypted in transit and at rest using AES-256 protocols.
            </p>
            <span className="material-symbols-outlined absolute -right-4 -bottom-6 text-[160px] text-slate-800 opacity-20 pointer-events-none">
              lock
            </span>
          </div>
          <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl flex flex-col justify-center items-center text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
              <span className="material-symbols-outlined text-3xl">fingerprint</span>
            </div>
            <h4 className="font-bold text-lg text-white mb-1">Access Logging</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Every view and download is authenticated and recorded in the audit trail.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-sm">Loading legal agreements...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="glass-panel border border-slate-850 p-16 text-center rounded-2xl space-y-4">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <span className="material-symbols-outlined text-3xl">folder_off</span>
            </div>
            <h3 className="text-xl font-bold text-white">Vault is Empty</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              You haven't uploaded any documents. Secure your properties by adding lease agreements or insurance policies.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const matchedProp = properties.find(p => p._id === doc.propertyId);
              return (
                <div key={doc._id} className="glass-panel bg-slate-900/30 border border-slate-850 p-6 rounded-2xl hover:border-slate-800 transition-all flex flex-col justify-between h-56 group shadow-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-2xl">{getDocTypeIcon(doc.documentType)}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(doc.status)}`}>
                          {doc.status}
                        </span>
                        <button 
                          onClick={() => handleDelete(doc._id)}
                          className="text-slate-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded transition-colors"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors truncate" title={doc.fileName}>
                        {doc.fileName}
                      </h4>
                      {matchedProp && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-xs">domain</span>
                          {matchedProp.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-850 mt-4">
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Get</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-black text-white">Vault Deposit</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Document Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name *</label>
                  <input 
                    type="text"
                    name="fileName"
                    value={formData.fileName}
                    onChange={handleChange}
                    required
                    className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none"
                    placeholder="e.g. Skyline Penthouse Lease Agreement"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Document Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Type</label>
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none"
                    >
                      <option value="LeaseAgreement" className="bg-slate-950">Lease Agreement</option>
                      <option value="Insurance" className="bg-slate-950">Insurance Policy</option>
                      <option value="PropertyDeed" className="bg-slate-950">Property Deed</option>
                      <option value="TaxDocument" className="bg-slate-950">Tax Document</option>
                      <option value="Other" className="bg-slate-950">Other Legal record</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sign status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none"
                    >
                      <option value="Unsigned" className="bg-slate-950">Unsigned</option>
                      <option value="Signed" className="bg-slate-950">Signed / Executed</option>
                      <option value="Expired" className="bg-slate-950">Expired</option>
                    </select>
                  </div>
                </div>

                {/* Associate Property */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associate with Property</label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none"
                  >
                    <option value="" className="bg-slate-950">No Property Association (General)</option>
                    {properties.map(p => (
                      <option key={p._id} value={p._id} className="bg-slate-950">{p.title}</option>
                    ))}
                  </select>
                </div>

                {/* File Dropzone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload File *</label>
                  <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center transition-all bg-slate-950/30 group cursor-pointer hover:bg-slate-900/10">
                    <input 
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all mb-3">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    {selectedFileName ? (
                      <div className="text-center space-y-1 z-10 pointer-events-none">
                        <p className="text-white font-bold text-sm truncate max-w-[280px]">
                          {selectedFileName}
                        </p>
                        <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          File loaded successfully
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 pointer-events-none">
                        <p className="text-white font-bold text-sm">Click or Drag to Upload</p>
                        <p className="text-xs text-slate-500">PDF, PNG, JPG or Word files up to 8MB</p>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {fileError}
                    </p>
                  )}
                </div>

                {/* S3 Roadmapped indicator */}
                <div className="relative group bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex items-start gap-3 overflow-hidden">
                  <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <span className="material-symbols-outlined text-lg">cloud_sync</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-white text-sm">Secure Cloud Storage</h5>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Roadmapped
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Direct Amazon S3 bucket syncing and multi-region backups are coming soon. Your files are temporarily saved securely in the Postgres database vault.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-full font-bold bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitLoading}
                    className="px-8 py-2.5 rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span>Deposit File</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordDocuments;