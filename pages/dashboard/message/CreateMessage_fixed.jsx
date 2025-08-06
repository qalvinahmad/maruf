import ClientOnly from '@/components/ClientOnly';
import { Toast, showToast } from '@/components/ui/toast';
import { IconArrowLeft, IconChartColumn, IconEye, IconMessageHeart, IconMessages, IconPhoto, IconPlayerPlay, IconSend, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import HeaderTeacher from '../../../components/layout/HeaderTeacher';
import { supabase } from '../../../lib/supabaseClient';

const CreateMessage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
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
  
  // Community messages states
  const [showCommunityMessages, setShowCommunityMessages] = useState(false);
  const [channelMessages, setChannelMessages] = useState([]);
  const [votingLoadingStates, setVotingLoadingStates] = useState({});
  const [pollTimers, setPollTimers] = useState({});
  
  // File refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Check localStorage for fallback auth
          const isLoggedIn = localStorage.getItem('isLoggedIn');
          const storedUserName = localStorage.getItem('userName');
          
          if (!isLoggedIn || isLoggedIn !== 'true') {
            router.push('/authentication/login');
            return;
          }
          
          setUserName(storedUserName || 'User');
        } else {
          setUserSession(session);
          
          // Fetch complete teacher profile with all details
          const { data: profile } = await supabase
            .from('profiles')
            .select(`
              *,
              teacher_profiles (
                teaching_experience,
                specialization,
                institution,
                is_verified,
                status
              )
            `)
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            // Merge teacher_profiles data into main profile
            const completeProfile = {
              ...profile,
              teaching_experience: profile.teacher_profiles?.teaching_experience,
              specialization: profile.teacher_profiles?.specialization,
              institution: profile.teacher_profiles?.institution,
              is_verified: profile.teacher_profiles?.is_verified,
              status: profile.teacher_profiles?.status
            };
            
            setUserProfile(completeProfile);
            setUserName(profile.full_name || profile.email || 'User');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        showToast.error('Terjadi kesalahan autentikasi');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch community messages when needed
  useEffect(() => {
    if (showCommunityMessages && userSession) {
      fetchCommunityMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('channel_messages')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'channel_messages' },
          () => {
            fetchCommunityMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [showCommunityMessages, userSession]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages]);

  // Poll timer calculations
  const calculateRemainingTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const pollDurationMs = 24 * 60 * 60 * 1000; // 24 hours
    const endTime = new Date(created.getTime() + pollDurationMs);
    const remaining = endTime.getTime() - now.getTime();
    
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Update poll timers
  useEffect(() => {
    if (channelMessages.length > 0) {
      const updateTimers = () => {
        const newTimers = {};
        channelMessages.forEach(message => {
          if (message.message_type === 'poll') {
            newTimers[message.id] = calculateRemainingTime(message.created_at);
          }
        });
        setPollTimers(newTimers);
      };

      updateTimers();
      const interval = setInterval(updateTimers, 1000);
      return () => clearInterval(interval);
    }
  }, [channelMessages]);

  const fetchCommunityMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('channel_messages')
        .select(`
          *,
          profiles (
            full_name,
            role
          ),
          message_reactions (*),
          poll_votes (*)
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChannelMessages(messages || []);
    } catch (error) {
      console.error('Error fetching community messages:', error);
      showToast.error('Gagal mengambil pesan komunitas');
    }
  };

  const handleReaction = async (messageId, sticker) => {
    if (!userSession?.user?.id) return;

    try {
      // Check if user already reacted with this sticker
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userSession.user.id)
        .eq('sticker', sticker)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: userSession.user.id,
            sticker: sticker
          });
      }

      // Refresh messages
      fetchCommunityMessages();
    } catch (error) {
      console.error('Error handling reaction:', error);
      showToast.error('Gagal memberikan reaksi');
    }
  };

  const handlePollVote = async (messageId, optionIndex) => {
    if (!userSession?.user?.id) return;

    const loadingKey = `${messageId}-${optionIndex}`;
    setVotingLoadingStates(prev => ({ ...prev, [loadingKey]: true }));

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', userSession.user.id)
        .single();

      if (existingVote) {
        showToast.error('Anda sudah memberikan suara pada polling ini');
        return;
      }

      // Add vote
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          message_id: messageId,
          user_id: userSession.user.id,
          option_index: optionIndex
        });

      if (error) throw error;

      showToast.success('Suara Anda berhasil disimpan!');
      fetchCommunityMessages();
    } catch (error) {
      console.error('Error voting:', error);
      showToast.error('Gagal memberikan suara');
    } finally {
      setVotingLoadingStates(prev => {
        const newState = { ...prev };
        delete newState[loadingKey];
        return newState;
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      showToast.error('Gagal logout');
    }
  };

  // File handling
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

    // Reset input
    event.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      // Cleanup preview URL
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Poll handling
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

  // Submit message
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
      showToast.error(`Silakan pilih ${messageType === 'image' ? 'gambar' : 'video'} terlebih dahulu`);
      return;
    }

    setIsSubmitting(true);

    try {
      const messageData = {
        user_id: userSession.user.id,
        message_type: messageType,
        content: messageType === 'poll' ? pollQuestion : messageContent,
        created_at: new Date().toISOString()
      };

      if (messageType === 'poll') {
        messageData.poll_data = {
          options: pollOptions.filter(opt => opt.trim()).map(text => ({ text })),
          duration_hours: parseInt(pollDuration)
        };
      }

      if (messageType === 'image' || messageType === 'video') {
        // In a real app, you would upload files to storage first
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

      showToast.success('Pesan berhasil dikirim!');
      
      // Reset form
      setMessageContent('');
      setPollQuestion('');
      setPollOptions(['', '']);
      setSelectedFiles([]);
      setMessageType('text');
      
      // Redirect back after short delay
      setTimeout(() => {
        router.push('/dashboard/DashboardAnnouncement?tab=channel');
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
      label: 'Teks', 
      icon: IconMessageHeart, 
      color: 'from-blue-500 to-blue-600',
      description: 'Pesan teks sederhana'
    },
    { 
      type: 'image', 
      label: 'Gambar', 
      icon: IconPhoto, 
      color: 'from-green-500 to-green-600',
      description: 'Bagikan foto atau gambar'
    },
    { 
      type: 'video', 
      label: 'Video', 
      icon: IconPlayerPlay, 
      color: 'from-purple-500 to-purple-600',
      description: 'Bagikan video'
    },
    { 
      type: 'poll', 
      label: 'Poll', 
      icon: IconChartColumn, 
      color: 'from-orange-500 to-orange-600',
      description: 'Buat polling interaktif'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
        <Head>
          <title>Buat Pesan Baru • Makhrojul Huruf</title>
          <meta name="description" content="Buat pesan, polling, atau bagikan media" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Toast />

        <HeaderTeacher 
          userName={userName}
          teacherProfile={userProfile}
        />

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
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
                    {showCommunityMessages ? 'Pesan Komunitas' : 'Buat Pesan Baru'}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    {showCommunityMessages 
                      ? 'Lihat dan berinteraksi dengan pesan komunitas' 
                      : 'Bagikan pesan, buat polling, atau unggah media'
                    }
                  </p>
                </div>
              </div>

              {/* Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCommunityMessages(!showCommunityMessages)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showCommunityMessages
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'
                }`}
              >
                {showCommunityMessages ? (
                  <>
                    <IconMessageHeart size={18} />
                    <span>Buat Pesan</span>
                  </>
                ) : (
                  <>
                    <IconEye size={18} />
                    <span>Lihat Komunitas</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Message Type Selector - Only show when creating message */}
            {!showCommunityMessages && (
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
            )}
          </motion.div>

          {/* Community Messages View */}
          {showCommunityMessages ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                {/* Messages Area */}
                <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {channelMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <IconMessages size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Belum ada pesan di komunitas</p>
                      <p className="text-gray-400 text-sm">Mulai percakapan pertama!</p>
                    </div>
                  ) : (
                    channelMessages.map((message, index) => {
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-3"
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {message.profiles?.full_name?.charAt(0) || message.profiles?.role?.charAt(0) || 'U'}
                          </div>
                          
                          {/* Message Content */}
                          <div className="max-w-xs lg:max-w-md flex flex-col">
                            {/* Sender Info */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">
                                {message.profiles?.full_name || 'Unknown User'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                message.profiles?.role === 'admin' ? 'bg-red-100 text-red-600' :
                                message.profiles?.role === 'teacher' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {message.profiles?.role === 'admin' ? 'Admin' :
                                 message.profiles?.role === 'teacher' ? 'Guru' : 'Siswa'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 border border-gray-200">
                              {/* Text Message */}
                              {message.message_type === 'text' && (
                                <p className="text-sm">{message.content}</p>
                              )}
                              
                              {/* Poll Message */}
                              {message.message_type === 'poll' && message.poll_data && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-semibold text-gray-900">{message.content}</p>
                                    {/* Poll Timer */}
                                    <div className="text-xs">
                                      {(() => {
                                        const remainingTime = pollTimers[message.id];
                                        if (!remainingTime) {
                                          return (
                                            <span className="text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                              Berakhir
                                            </span>
                                          );
                                        }
                                        return (
                                          <span className="text-orange-600 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                                            {remainingTime.hours}j {remainingTime.minutes}m
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  
                                  {/* Expired Poll Notice */}
                                  {!pollTimers[message.id] && (
                                    <div className="mb-4 p-3 bg-gray-100 rounded-lg border-l-4 border-red-400">
                                      <p className="text-sm text-gray-700 font-medium">
                                        Periode voting telah berakhir
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    {message.poll_data.options.map((option, optionIndex) => {
                                      const votesForOption = message.poll_votes?.filter(vote => 
                                        vote.option_index === optionIndex
                                      ).length || 0;
                                      
                                      const userVoted = message.poll_votes?.some(vote => 
                                        vote.option_index === optionIndex && vote.user_id === userSession?.user?.id
                                      );
                                      
                                      const totalVotes = message.poll_votes?.length || 0;
                                      const percentage = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
                                      
                                      const isLoading = votingLoadingStates[`${message.id}-${optionIndex}`];
                                      const pollExpired = !pollTimers[message.id];
                                      const isDisabled = isLoading || pollExpired;

                                      return (
                                        <motion.button
                                          key={optionIndex}
                                          whileHover={{ scale: isDisabled ? 1 : 1.01 }}
                                          whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                                          onClick={() => !isDisabled && handlePollVote(message.id, optionIndex)}
                                          disabled={isDisabled}
                                          className={`w-full p-4 rounded-xl text-left text-sm transition-all duration-200 relative overflow-hidden group ${
                                            pollExpired
                                              ? 'bg-gray-50 border border-gray-200 cursor-not-allowed'
                                              : isLoading
                                              ? 'bg-gray-50 border border-gray-200 cursor-wait'
                                              : userVoted
                                              ? 'bg-blue-50 border border-blue-200 text-blue-900'
                                              : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                          }`}
                                        >
                                          {/* Progress indicator */}
                                          <div 
                                            className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out rounded-l-xl ${
                                              pollExpired 
                                                ? 'bg-gray-200' 
                                                : userVoted 
                                                ? 'bg-blue-200/60' 
                                                : 'bg-blue-100/40'
                                            }`}
                                            style={{ width: `${Math.max(percentage, 2)}%` }}
                                          ></div>
                                          
                                          <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-2 h-2 rounded-full transition-colors ${
                                                isLoading 
                                                  ? 'bg-gray-400 animate-pulse' 
                                                  : pollExpired 
                                                  ? 'bg-gray-400' 
                                                  : userVoted 
                                                  ? 'bg-blue-500' 
                                                  : 'bg-gray-300 group-hover:bg-blue-400'
                                              }`}></div>
                                              <span className={`font-medium transition-colors ${
                                                pollExpired 
                                                  ? 'text-gray-500' 
                                                  : userVoted 
                                                  ? 'text-blue-900' 
                                                  : 'text-gray-900 group-hover:text-blue-900'
                                              }`}>
                                                {option.text}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                              <span className={`font-semibold tabular-nums ${
                                                pollExpired 
                                                  ? 'text-gray-500' 
                                                  : userVoted 
                                                  ? 'text-blue-700' 
                                                  : 'text-gray-600'
                                              }`}>
                                                {votesForOption}
                                              </span>
                                              {totalVotes > 0 && (
                                                <span className={`tabular-nums ${
                                                  pollExpired 
                                                    ? 'text-gray-400' 
                                                    : userVoted 
                                                    ? 'text-blue-600' 
                                                    : 'text-gray-500'
                                                }`}>
                                                  {percentage}%
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Poll summary */}
                                  <div className={`pt-4 border-t transition-colors ${
                                    !pollTimers[message.id] 
                                      ? 'border-gray-200' 
                                      : 'border-gray-150'
                                  }`}>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600 font-medium">
                                        {message.poll_votes?.length || 0} total suara
                                      </span>
                                      <span className={`text-xs font-medium ${
                                        !pollTimers[message.id] 
                                          ? 'text-gray-500'
                                          : message.poll_votes?.some(vote => vote.user_id === userSession?.user?.id) 
                                            ? 'text-blue-600' 
                                            : 'text-gray-600'
                                      }`}>
                                        {!pollTimers[message.id] 
                                          ? 'Voting ditutup'
                                          : message.poll_votes?.some(vote => vote.user_id === userSession?.user?.id) 
                                            ? 'Anda telah memilih' 
                                            : 'Pilih salah satu'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Message Actions - Reactions */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {['👍', '❤️', '😊', '👏', '🔥', '💯', '🎉', '🤔'].map((sticker) => {
                                  const stickerCount = message.message_reactions?.filter(reaction => 
                                    reaction.sticker === sticker
                                  ).length || 0;
                                  
                                  const userReacted = message.message_reactions?.some(reaction => 
                                    reaction.sticker === sticker && reaction.user_id === userSession?.user?.id
                                  );

                                  return (
                                    <motion.div
                                      key={sticker}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full border-2 transition-all cursor-pointer ${
                                        userReacted 
                                          ? 'border-blue-500 bg-blue-50' 
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                      onClick={() => handleReaction(message.id, sticker)}
                                    >
                                      <span className="text-sm">{sticker}</span>
                                      {stickerCount > 0 && (
                                        <span className={`text-xs font-medium ${
                                          userReacted ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                          {stickerCount}
                                        </span>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  
                  {/* Auto-scroll target */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </motion.div>
          ) : (
            /* Create Message Form */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Text Message */}
                  {messageType === 'text' && (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tulis Pesan Anda
                      </label>
                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Ketik pesan Anda di sini..."
                        rows={6}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="text-right text-sm text-gray-500">
                        {messageContent.length}/1000 karakter
                      </div>
                    </motion.div>
                  )}

                  {/* Image Upload */}
                  {messageType === 'image' && (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unggah Gambar
                      </label>
                      
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileSelect(e, 'image')}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer"
                      >
                        <IconPhoto size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">Klik untuk pilih gambar</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF hingga 10MB</p>
                      </div>

                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Tambahkan caption (opsional)..."
                        rows={3}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      />

                      {/* Preview Images */}
                      {selectedFiles.filter(f => f.type === 'image').length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedFiles.filter(f => f.type === 'image').map((fileObj, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={fileObj.preview} 
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <IconX size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Video Upload */}
                  {messageType === 'video' && (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unggah Video
                      </label>
                      
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={(e) => handleFileSelect(e, 'video')}
                        accept="video/*"
                        className="hidden"
                      />
                      
                      <div 
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer"
                      >
                        <IconPlayerPlay size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">Klik untuk pilih video</p>
                        <p className="text-gray-500 text-sm mt-1">MP4, MOV, AVI hingga 100MB</p>
                      </div>

                      <textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Tambahkan deskripsi video (opsional)..."
                        rows={3}
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />

                      {/* Preview Videos */}
                      {selectedFiles.filter(f => f.type === 'video').length > 0 && (
                        <div className="space-y-2">
                          {selectedFiles.filter(f => f.type === 'video').map((fileObj, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <IconPlayerPlay size={20} className="text-purple-600" />
                                <span className="text-sm font-medium">{fileObj.file.name}</span>
                                <span className="text-xs text-gray-500">
                                  {(fileObj.file.size / 1024 / 1024).toFixed(1)} MB
                                </span>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <IconX size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Poll Creation */}
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
                          Pertanyaan Poll
                        </label>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="Apa pertanyaan Anda?"
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
                          Durasi Poll
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
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
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
                        Kirim Pesan
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </ClientOnly>
  );
};

export default CreateMessage;
