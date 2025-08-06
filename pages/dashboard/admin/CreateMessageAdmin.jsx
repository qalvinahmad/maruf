import AdminHeader from '@/components/admin/adminHeader';
import ClientOnly from '@/components/ClientOnly';
import { Toast, showToast } from '@/components/ui/toast';
import { IconArrowLeft, IconCamera, IconChartColumn, IconFile, IconMessageHeart, IconPhoto, IconPlayerPlay, IconSend, IconUpload, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const CreateMessageAdmin = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [adminProfile, setAdminProfile] = useState(null);
  const [userSession, setUserSession] = useState(null);
  
  // Message states
  const [messageType, setMessageType] = useState('text');
  const [messageContent, setMessageContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Poll states
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('24'); // hours
  
  // File refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auth check for admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const isAdmin = localStorage.getItem('isAdmin');
        const storedUserName = localStorage.getItem('userName');
        
        if (!isAdmin || isAdmin !== 'true') {
          router.push('/authentication/admin/loginAdmin');
          return;
        }
        
        setUserName(storedUserName || 'Admin');
        
        // Try to get Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserSession(session);
          
          // Fetch admin profile
          const { data: profile } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (profile) {
            setAdminProfile(profile);
            setUserName(profile.full_name || profile.email || 'Admin');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        showToast.error('Terjadi kesalahan autentikasi');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      router.push('/authentication/admin/loginAdmin');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Gagal logout');
    }
  };

  // File handling (same as regular CreateMessage)
  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => {
      if (type === 'image') {
        return file.type.startsWith('image/');
      } else if (type === 'video') {
        return file.type.startsWith('video/');
      }
      return true;
    });

    if (validFiles.length !== files.length) {
      showToast.warning(`Beberapa file tidak valid untuk tipe ${type}`);
    }

    setSelectedFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      type,
      preview: type === 'image' ? URL.createObjectURL(file) : null
    }))]);

    event.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Poll handling (same as regular CreateMessage)
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    } else {
      showToast.warning('Maksimal 6 opsi poll');
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    } else {
      showToast.warning('Minimal 2 opsi poll');
    }
  };

  // Submit message with admin privileges
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validation
    if (messageType === 'text' && !messageContent.trim()) {
      showToast.error('Pesan tidak boleh kosong');
      return;
    }

    if (messageType === 'poll') {
      if (!pollQuestion.trim()) {
        showToast.error('Pertanyaan poll tidak boleh kosong');
        return;
      }
      
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        showToast.error('Poll harus memiliki minimal 2 opsi');
        return;
      }
    }

    if ((messageType === 'image' || messageType === 'video') && selectedFiles.length === 0) {
      showToast.error(`Pilih ${messageType === 'image' ? 'gambar' : 'video'} terlebih dahulu`);
      return;
    }

    setIsSubmitting(true);

    try {
      const messageData = {
        user_id: userSession?.user?.id || 'admin-user',
        message_type: messageType,
        created_at: new Date().toISOString(),
        is_admin_message: true // Flag untuk pesan dari admin
      };

      if (messageType === 'text') {
        messageData.content = messageContent.trim();
      } else if (messageType === 'poll') {
        messageData.content = pollQuestion.trim();
        messageData.poll_data = {
          options: pollOptions.filter(opt => opt.trim()).map(opt => ({ 
            text: opt.trim(), 
            votes: 0 
          })),
          duration_hours: parseInt(pollDuration),
          created_at: new Date().toISOString()
        };
      } else if (messageType === 'image' || messageType === 'video') {
        messageData.content = messageContent.trim() || '';
        messageData.media_url = 'placeholder-url';
        messageData.file_count = selectedFiles.length;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('channel_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;

      showToast.success('Pesan admin berhasil dikirim!');
      
      // Reset form
      setMessageContent('');
      setPollQuestion('');
      setPollOptions(['', '']);
      setSelectedFiles([]);
      setMessageType('text');
      
      // Redirect back after short delay
      setTimeout(() => {
        router.push('/dashboard/admin/project/DashboardProjects');
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      showToast.error('Gagal mengirim pesan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageTypes = [
    { 
      type: 'text', 
      label: 'Pengumuman', 
      icon: IconMessageHeart, 
      color: 'from-blue-500 to-blue-600',
      description: 'Pengumuman penting'
    },
    { 
      type: 'image', 
      label: 'Gambar', 
      icon: IconPhoto, 
      color: 'from-green-500 to-green-600',
      description: 'Bagikan foto atau infografis'
    },
    { 
      type: 'video', 
      label: 'Video', 
      icon: IconPlayerPlay, 
      color: 'from-purple-500 to-purple-600',
      description: 'Video edukasi'
    },
    { 
      type: 'poll', 
      label: 'Survey', 
      icon: IconChartColumn, 
      color: 'from-orange-500 to-orange-600',
      description: 'Buat survey untuk siswa'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
        <Head>
          <title>Buat Pesan Admin • Makhrojul Huruf</title>
          <meta name="description" content="Panel admin untuk membuat pesan, pengumuman, dan survey" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Toast />

        <AdminHeader 
          userName={userName}
          onLogout={handleLogout}
        />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
              >
                <IconArrowLeft size={20} className="text-gray-600" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <IconMessageHeart size={28} className="text-pink-500" />
                  Panel Admin - Buat Konten
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Buat pengumuman, survey, atau bagikan konten untuk siswa
                </p>
              </div>
            </div>

            {/* Message Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {messageTypes.map((type) => (
                <motion.button
                  key={type.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMessageType(type.type)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    messageType === type.type
                      ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <type.icon size={24} className="mx-auto mb-2" />
                  <div className="text-sm font-semibold">{type.label}</div>
                  <div className={`text-xs mt-1 ${
                    messageType === type.type ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {type.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area - sama seperti CreateMessage tapi dengan styling admin */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              {/* Admin badge */}
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <IconMessageHeart size={16} />
                Pesan Admin
              </div>

              <AnimatePresence mode="wait">
                {/* Same content as CreateMessage but with admin context */}
                {messageType === 'text' && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tulis Pengumuman Admin
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Ketik pengumuman penting untuk siswa..."
                      rows={6}
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                    <div className="text-right text-sm text-gray-500">
                      {messageContent.length}/1000 karakter
                    </div>
                  </motion.div>
                )}

                {/* Poll Creator untuk admin */}
                {messageType === 'poll' && (
                  <motion.div
                    key="poll"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pertanyaan Survey/Poll
                      </label>
                      <input
                        type="text"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        placeholder="Buat survey untuk mengukur pemahaman siswa..."
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Opsi Jawaban
                      </label>
                      <div className="space-y-3">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <div className="flex-shrink-0 w-8 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-medium text-sm">
                              {index + 1}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updatePollOption(index, e.target.value)}
                              placeholder={`Opsi ${index + 1}`}
                              className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {pollOptions.length > 2 && (
                              <button
                                onClick={() => removePollOption(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <IconX size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {pollOptions.length < 6 && (
                        <button
                          onClick={addPollOption}
                          className="mt-3 text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                        >
                          + Tambah Opsi
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durasi Survey
                      </label>
                      <select
                        value={pollDuration}
                        onChange={(e) => setPollDuration(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="1">1 Jam</option>
                        <option value="6">6 Jam</option>
                        <option value="12">12 Jam</option>
                        <option value="24">24 Jam</option>
                        <option value="48">2 Hari</option>
                        <option value="168">1 Minggu</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Image dan Video upload */}
                {(messageType === 'image' || messageType === 'video') && (
                  <motion.div
                    key={messageType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Caption/Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi (opsional)
                      </label>
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder={`Tambahkan deskripsi untuk ${messageType === 'image' ? 'gambar' : 'video'} ini...`}
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* File Upload Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {messageType === 'image' ? 'Upload Gambar' : 'Upload Video'}
                      </label>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                            messageType === 'image' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {messageType === 'image' ? (
                              <IconPhoto size={24} />
                            ) : (
                              <IconPlayerPlay size={24} />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">
                            Drag & drop {messageType === 'image' ? 'gambar' : 'video'} atau klik untuk memilih
                          </p>
                          
                          <div className="flex gap-2 justify-center">
                            {messageType === 'image' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                  <IconCamera size={16} />
                                  Pilih Gambar
                                </button>
                                <input
                                  ref={imageInputRef}
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handleFileSelect(e, 'image')}
                                  className="hidden"
                                />
                              </>
                            )}
                            
                            {messageType === 'video' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => videoInputRef.current?.click()}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                  <IconUpload size={16} />
                                  Pilih Video
                                </button>
                                <input
                                  ref={videoInputRef}
                                  type="file"
                                  multiple
                                  accept="video/*"
                                  onChange={(e) => handleFileSelect(e, 'video')}
                                  className="hidden"
                                />
                              </>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {messageType === 'image' 
                              ? 'Maksimal 10MB per gambar, format JPG, PNG, atau GIF'
                              : 'Maksimal 50MB per video, format MP4, MOV, atau AVI'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Preview */}
                    {selectedFiles.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Preview ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''})
                        </label>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedFiles.map((fileObj, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                {fileObj.type === 'image' && fileObj.preview ? (
                                  <img
                                    src={fileObj.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <IconFile size={32} />
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => removeFile(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  <IconX size={12} />
                                </button>
                              </div>
                              
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {fileObj.file.name}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Batal
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <IconSend size={16} />
                      Publikasikan
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </ClientOnly>
  );
};

export default CreateMessageAdmin;
