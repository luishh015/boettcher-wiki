import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [detailedCategories, setDetailedCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form states
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: '',
    tags: [],
    attachments: []
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    color: 'bg-blue-100 text-blue-800 border-blue-500',
    description: ''
  });

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    fetchKnowledgeEntries();
    fetchCategories();
    fetchStats();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDetailedCategories();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(true);
          setAdminUser(data.username);
        } else {
          localStorage.removeItem('admin_token');
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        localStorage.removeItem('admin_token');
      }
    }
  };

  const fetchKnowledgeEntries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/knowledge`);
      const data = await response.json();
      setKnowledgeEntries(data);
    } catch (error) {
      console.error('Error fetching knowledge entries:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDetailedCategories = async () => {
    if (!isAdmin) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BACKEND_URL}/api/categories/detailed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDetailedCategories(data);
    } catch (error) {
      console.error('Error fetching detailed categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.access_token);
        setIsAdmin(true);
        setAdminUser(data.username);
        setShowLogin(false);
        setLoginData({ username: '', password: '' });
      } else {
        alert('Ungültige Anmeldedaten');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
    setAdminUser('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !selectedCategory) {
      fetchKnowledgeEntries();
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCategory || null
        })
      });
      const data = await response.json();
      setKnowledgeEntries(data);
    } catch (error) {
      console.error('Error searching knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    if (category) {
      setLoading(true);
      fetch(`${BACKEND_URL}/api/knowledge?category=${category}`)
        .then(response => response.json())
        .then(data => {
          setKnowledgeEntries(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error filtering by category:', error);
          setLoading(false);
        });
    } else {
      fetchKnowledgeEntries();
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const tagsArray = newEntry.tags.length > 0 ? newEntry.tags.split(',').map(tag => tag.trim()) : [];
      
      const response = await fetch(`${BACKEND_URL}/api/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newEntry,
          tags: tagsArray,
          attachments: uploadedFiles
        })
      });
      
      if (response.ok) {
        setNewEntry({ question: '', answer: '', category: '', tags: [], attachments: [] });
        setUploadedFiles([]);
        setShowAddEntry(false);
        fetchKnowledgeEntries();
        fetchCategories();
        fetchStats();
      } else {
        alert('Fehler beim Hinzufügen des Eintrags');
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Fehler beim Hinzufügen des Eintrags');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });
      
      if (response.ok) {
        setNewCategory({ name: '', icon: '', color: 'bg-blue-100 text-blue-800 border-blue-500', description: '' });
        setShowAddCategory(false);
        fetchCategories();
        fetchDetailedCategories();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.detail || 'Fehler beim Hinzufügen der Kategorie');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Fehler beim Hinzufügen der Kategorie');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!deleteConfirm || deleteConfirm !== entryId) {
      setDeleteConfirm(entryId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${BACKEND_URL}/api/knowledge/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchKnowledgeEntries();
        fetchStats();
        setDeleteConfirm(null);
      } else {
        alert('Fehler beim Löschen des Eintrags');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Fehler beim Löschen des Eintrags');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryDeleteConfirm || categoryDeleteConfirm !== categoryId) {
      setCategoryDeleteConfirm(categoryId);
      setTimeout(() => setCategoryDeleteConfirm(null), 5000); // 5 Sekunden für wichtige Entscheidung
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${BACKEND_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        // Erfolgreiche Nachricht anzeigen
        alert(result.message);
        
        fetchCategories();
        fetchDetailedCategories();
        fetchKnowledgeEntries(); // Einträge neu laden da Kategorien geändert wurden
        fetchStats();
        setCategoryDeleteConfirm(null);
      } else {
        const error = await response.json();
        alert(error.detail || 'Fehler beim Löschen der Kategorie');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Fehler beim Löschen der Kategorie');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    const token = localStorage.getItem('admin_token');
    const newFiles = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${BACKEND_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (response.ok) {
          const uploadedFile = await response.json();
          newFiles.push(uploadedFile);
        } else {
          alert(`Fehler beim Hochladen von ${file.name}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Fehler beim Hochladen von ${file.name}`);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const downloadFile = (fileId, filename) => {
    const link = document.createElement('a');
    link.href = `${BACKEND_URL}/api/files/${fileId}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'images':
        return '🖼️';
      case 'documents':
        return '📄';
      case 'spreadsheets':
        return '📊';
      case 'presentations':
        return '📋';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleExpanded = (entryId) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'IT-Support':
        return '💻';
      case 'Produktion':
        return '🔧';
      case 'Qualitätskontrolle':
        return '🔍';
      case 'Verwaltung':
        return '📋';
      case 'Wartung':
        return '⚙️';
      case 'Sicherheit':
        return '🛡️';
      case 'Schulung':
        return '🎓';
      default:
        return '📘';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'IT-Support':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'Produktion':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'Qualitätskontrolle':
        return 'bg-purple-100 text-purple-800 border-purple-500';
      case 'Verwaltung':
        return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'Wartung':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'Sicherheit':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'Schulung':
        return 'bg-indigo-100 text-indigo-800 border-indigo-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const predefinedColors = [
    { name: 'Blau', value: 'bg-blue-100 text-blue-800 border-blue-500' },
    { name: 'Grün', value: 'bg-green-100 text-green-800 border-green-500' },
    { name: 'Lila', value: 'bg-purple-100 text-purple-800 border-purple-500' },
    { name: 'Orange', value: 'bg-orange-100 text-orange-800 border-orange-500' },
    { name: 'Rot', value: 'bg-red-100 text-red-800 border-red-500' },
    { name: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-500' },
    { name: 'Gelb', value: 'bg-yellow-100 text-yellow-800 border-yellow-500' },
    { name: 'Rosa', value: 'bg-pink-100 text-pink-800 border-pink-500' }
  ];

  const commonIcons = ['📘', '🔧', '💻', '📋', '⚙️', '🛡️', '🎓', '🔍', '📊', '🏭', '🔬', '📞', '🎨', '🌟'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Böttcher Wiki</h1>
                <p className="text-blue-600 font-medium">Fahrradmanufaktur Wissensdatenbank</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2V8ZW58MHx8fHwxNzUyODU2MTI2fDA&ixlib=rb-4.1.0&q=85" 
                  alt="Professional Office" 
                  className="w-32 h-20 object-cover rounded-lg shadow-md"
                />
              </div>
              {isAdmin ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    👨‍💼 {adminUser}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Abmelden
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔐 Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Einträge</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_entries || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Kategorien</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories_count || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-full mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.707 14.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414 0l-11-11a1 1 0 010-1.414l1.414-1.414a1 1 0 011.414 0l11 11z"/>
                  <path d="M13 6l3 3-1.5 1.5L11 7 13 6z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Datei-Anhänge</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_attachments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Nach Kategorie filtern</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏠 Alle
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Suche nach Fragen oder Lösungen..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Suche...' : 'Suchen'}
            </button>
          </div>
        </div>

        {/* Admin Action Buttons - nur für eingeloggte Admins */}
        {isAdmin && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setShowAddEntry(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md"
            >
              ➕ Neue Frage/Antwort hinzufügen
            </button>
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md"
            >
              🏷️ Neue Kategorie hinzufügen
            </button>
            <button
              onClick={() => setShowManageCategories(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-md"
            >
              🗂️ Kategorien verwalten
            </button>
          </div>
        )}

        {/* Knowledge Entries */}
        <div className="space-y-4">
          {knowledgeEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                <p className="text-lg font-medium mb-2">Keine Einträge gefunden</p>
                <p className="text-gray-400">Versuchen Sie andere Suchbegriffe oder wählen Sie eine andere Kategorie.</p>
              </div>
            </div>
          ) : (
            knowledgeEntries.map(entry => (
              <div key={entry.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${getCategoryColor(entry.category).split(' ')[2]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(entry.category)}`}>
                        {getCategoryIcon(entry.category)} {entry.category}
                      </span>
                      
                      {/* Admin Delete Button */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            deleteConfirm === entry.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {deleteConfirm === entry.id ? '🗑️ Bestätigen' : '🗑️ Löschen'}
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{entry.question}</h3>
                    
                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Answer - Expandable */}
                    <div className="mb-3">
                      <div className={`text-gray-700 ${expandedEntryId === entry.id ? '' : 'line-clamp-3'}`}>
                        {entry.answer.split('\n').map((line, index) => (
                          <div key={index} className="mb-1">{line}</div>
                        ))}
                      </div>
                      {entry.answer.length > 150 && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                        >
                          {expandedEntryId === entry.id ? '▲ Weniger anzeigen' : '▼ Mehr anzeigen'}
                        </button>
                      )}
                    </div>

                    {/* File Attachments */}
                    {entry.attachments && entry.attachments.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">📎 Anhänge:</h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.attachments.map(attachment => (
                            <div key={attachment.id} className="flex items-center bg-gray-50 rounded-lg p-2 text-sm">
                              {attachment.file_type === 'images' && attachment.thumbnail ? (
                                <img 
                                  src={`data:image/jpeg;base64,${attachment.thumbnail}`}
                                  alt={attachment.filename}
                                  className="w-8 h-8 rounded object-cover mr-2"
                                />
                              ) : (
                                <span className="text-lg mr-2">{getFileIcon(attachment.file_type)}</span>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 truncate max-w-40">{attachment.filename}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                              </div>
                              <button
                                onClick={() => downloadFile(attachment.id, attachment.filename)}
                                className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs"
                              >
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Erstellt: {new Date(entry.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">🔐 Admin-Anmeldung</h3>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Benutzername</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Passwort</label>
                <input
                  required
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Entry Modal - nur für Admins */}
      {showAddEntry && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Neue Frage/Antwort hinzufügen</h3>
            <form onSubmit={handleAddEntry}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Frage</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newEntry.question}
                  onChange={(e) => setNewEntry({...newEntry, question: e.target.value})}
                  placeholder="z.B. Was tun wenn der Scanner nicht funktioniert?"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Antwort/Lösung</label>
                <textarea
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="8"
                  value={newEntry.answer}
                  onChange={(e) => setNewEntry({...newEntry, answer: e.target.value})}
                  placeholder="Detaillierte Schritt-für-Schritt Anleitung..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                >
                  <option value="">Kategorie auswählen</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (kommagetrennt)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newEntry.tags}
                  onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                  placeholder="z.B. scanner, hardware, fehlerbehebung"
                />
              </div>

              {/* File Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Datei-Anhänge</label>
                
                {/* Drag & Drop Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Dateien hierher ziehen</span> oder
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    📁 Dateien auswählen
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Unterstützt: Bilder, PDFs, Office-Dokumente (max. 10MB)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Hochgeladene Dateien:</h5>
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center bg-gray-50 rounded-lg p-3">
                        {file.file_type === 'images' && file.thumbnail ? (
                          <img 
                            src={`data:image/jpeg;base64,${file.thumbnail}`}
                            alt={file.filename}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        ) : (
                          <span className="text-2xl mr-3">{getFileIcon(file.file_type)}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{file.filename}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(file.id)}
                          className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                        >
                          Entfernen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddEntry(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Hinzufügen...' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal - nur für Admins */}
      {showAddCategory && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">🏷️ Neue Kategorie hinzufügen</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="z.B. Notfallprozeduren"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="flex gap-2 mb-2">
                  {commonIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, icon})}
                      className={`px-3 py-2 rounded-lg text-lg ${newCategory.icon === icon ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  placeholder="oder eigenes Icon eingeben"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Farbe</label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, color: color.value})}
                      className={`px-3 py-2 rounded-lg text-sm ${color.value} ${newCategory.color === color.value ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Kurze Beschreibung der Kategorie..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Hinzufügen...' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal - nur für Admins */}
      {showManageCategories && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">🗂️ Kategorien verwalten</h3>
            
            {detailedCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Keine benutzerdefinierten Kategorien vorhanden.</p>
                <p className="text-sm text-gray-400 mt-2">Erstellen Sie neue Kategorien über "Neue Kategorie hinzufügen".</p>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-700">
                      <strong>Wichtiger Hinweis:</strong> Beim Löschen einer Kategorie werden alle zugehörigen Einträge automatisch auf "Allgemein" umgestellt.
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {detailedCategories.map(category => (
                    <div key={category.id} className={`p-4 rounded-lg border-2 ${category.color}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h4 className="font-semibold text-lg">{category.name}</h4>
                            {category.description && (
                              <p className="text-sm opacity-80">{category.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs opacity-70">
                            Erstellt: {new Date(category.created_at).toLocaleDateString('de-DE')}
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              categoryDeleteConfirm === category.id
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            {categoryDeleteConfirm === category.id ? '🗑️ ENDGÜLTIG LÖSCHEN' : '🗑️ Löschen'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ➕ Neue Kategorie hinzufügen
              </button>
              <button
                onClick={() => setShowManageCategories(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;