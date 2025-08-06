import { showToast } from '@/components/ui/toast';
import { IconCalendarEvent, IconCheck, IconEdit, IconEye, IconGift, IconMicrophone, IconPlus, IconTrash, IconTrophy, IconUserCheck, IconUsers, IconX } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For event detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    participants: [],
    rewards: [],
    tests: [],
    results: []
  });
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // For event statistics
  const [eventStats, setEventStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});
  
  // For test questions dialog
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [editingTests, setEditingTests] = useState([]);
  
  // For rewards dialog
  const [isRewardsDialogOpen, setIsRewardsDialogOpen] = useState(false);
  const [editingRewards, setEditingRewards] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count),
          event_user_results(count),
          event_pronunciation_tests(count)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Process data to include statistics
      const processedEvents = data?.map(event => ({
        ...event,
        registrationCount: event.event_registrations[0]?.count || 0,
        resultCount: event.event_user_results[0]?.count || 0,
        testCount: event.event_pronunciation_tests[0]?.count || 0
      })) || [];
      
      setEvents(processedEvents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Belum ditentukan';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    // Handle PostgreSQL time format 'HH:MM:SS'
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Akan Datang';
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'competition': return 'Kompetisi';
      case 'workshop': return 'Workshop';
      case 'seminar': return 'Seminar';
      case 'exam': return 'Ujian';
      case 'pronunciation_test': return 'Tes Pengucapan';
      case 'reading_test': return 'Tes Membaca';
      default: return type;
    }
  };
  
  // Handler functions for events
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;
    
    try {
      setLoading(true);
      
      // First check if there are related records
      const { data: registrationData } = await supabase
        .from('event_registrations')
        .select('count')
        .eq('event_id', eventId)
        .single();
        
      if (registrationData && registrationData.count > 0) {
        showToast.error('Event ini sudah memiliki pendaftaran. Hapus pendaftaran terlebih dahulu.');
        return;
      }
      
      // Delete event_pronunciation_tests first (foreign key constraint)
      await supabase
        .from('event_pronunciation_tests')
        .delete()
        .eq('event_id', eventId);
      
      // Delete event_rewards
      await supabase
        .from('event_rewards')
        .delete()
        .eq('event_id', eventId);
      
      // Finally delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
        
      if (error) throw error;
      
      showToast.success('Event berhasil dihapus');
      fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      showToast.error('Gagal menghapus event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchEventDetails = async (eventId) => {
    try {
      setLoadingDetails(true);
      
      // Fetch event participants (without complex joins)
      const { data: participants, error: participantsError } = await supabase
        .from('event_registrations')
        .select('id, user_id, registered_at, status')
        .eq('event_id', eventId);
        
      if (participantsError) throw participantsError;
      
      // Fetch user details separately
      let participantsWithUserData = [];
      if (participants && participants.length > 0) {
        const userIds = participants.map(p => p.user_id);
        
        // Get user profiles
        const { data: userProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, school_name, email')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
        // Combine participant data with user profiles
        participantsWithUserData = participants.map(participant => {
          const userProfile = userProfiles?.find(profile => profile.id === participant.user_id);
          return {
            ...participant,
            users: userProfile ? {
              id: userProfile.id,
              email: userProfile.email,
              profiles: {
                name: userProfile.name,
                school_name: userProfile.school_name
              }
            } : null
          };
        });
      }
      
      // Fetch event rewards
      console.log('Fetching rewards for event:', eventId);
      const { data: rewards, error: rewardsError } = await supabase
        .from('event_rewards')
        .select('*')
        .eq('event_id', eventId)
        .order('min_score');
        
      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
        throw rewardsError;
      }
      console.log('Fetched rewards:', rewards);
      
      // Fetch pronunciation tests for this event
      console.log('Fetching pronunciation tests for event:', eventId);
      const { data: tests, error: testsError } = await supabase
        .from('event_pronunciation_tests')
        .select('*')
        .eq('event_id', eventId);
        
      if (testsError) {
        console.error('Error fetching tests:', testsError);
        throw testsError;
      }
      console.log('Fetched tests:', tests);
      
      // Fetch user results (without complex joins)
      console.log('Fetching user results for event:', eventId);
      const { data: results, error: resultsError } = await supabase
        .from('event_user_results')
        .select('id, user_id, total_score, completed_at, status')
        .eq('event_id', eventId)
        .order('total_score', { ascending: false });
        
      if (resultsError) {
        console.error('Error fetching results:', resultsError);
        throw resultsError;
      }
      console.log('Fetched results:', results);
      
      // Fetch user details for results separately
      let resultsWithUserData = [];
      if (results && results.length > 0) {
        const resultUserIds = results.map(r => r.user_id);
        
        // Get user profiles for results
        const { data: resultUserProfiles, error: resultProfilesError } = await supabase
          .from('profiles')
          .select('id, name, school_name, email')
          .in('id', resultUserIds);
          
        if (resultProfilesError) {
          console.error('Error fetching result profiles:', resultProfilesError);
        }
        
        // Combine result data with user profiles
        resultsWithUserData = results.map(result => {
          const userProfile = resultUserProfiles?.find(profile => profile.id === result.user_id);
          return {
            ...result,
            users: userProfile ? {
              id: userProfile.id,
              email: userProfile.email,
              profiles: {
                name: userProfile.name,
                school_name: userProfile.school_name
              }
            } : null
          };
        });
      }
      
      const eventDetailsData = {
        participants: participantsWithUserData || [],
        rewards: rewards || [],
        tests: tests || [],
        results: resultsWithUserData || []
      };
      
      console.log('Setting event details:', eventDetailsData);
      console.log('Participants count:', participantsWithUserData?.length || 0);
      console.log('Rewards count:', rewards?.length || 0);
      console.log('Tests count:', tests?.length || 0);
      console.log('Results count:', resultsWithUserData?.length || 0);
      
      setEventDetails(eventDetailsData);
      
    } catch (err) {
      console.error('Error fetching event details:', err);
      showToast.error('Gagal memuat detail event: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
    fetchEventDetails(event.id);
  };
  
  const handleEditTests = (event) => {
    console.log('Opening test editor for event:', event.title);
    setSelectedEvent(event);
    // Set current tests or default tests
    if (eventDetails.tests && eventDetails.tests.length > 0) {
      setEditingTests([...eventDetails.tests]);
    } else {
      // Set default test if none exist
      setEditingTests([
        {
          surah_name: 'Al-Fatihah',
          ayah_start: 1,
          ayah_end: 7,
          duration_seconds: 60,
          min_score: 70,
          max_attempts: 3
        }
      ]);
    }
    setIsTestDialogOpen(true);
  };
  
  const handleSubmitTests = async (tests) => {
    try {
      console.log('Submitting tests for event ID:', selectedEvent.id);
      console.log('Tests to submit:', tests);
      
      // Delete existing tests
      const { error: deleteError } = await supabase
        .from('event_pronunciation_tests')
        .delete()
        .eq('event_id', selectedEvent.id);

      if (deleteError) {
        console.error('Error deleting existing tests:', deleteError);
      } else {
        console.log('Successfully deleted existing tests');
      }

      // Insert new tests
      if (tests.length > 0) {
        const testsToInsert = tests.map(test => ({
          event_id: selectedEvent.id,
          surah_name: test.surah_name || '',
          ayah_start: test.ayah_start || 1,
          ayah_end: test.ayah_end || 1,
          duration_seconds: test.duration_seconds || 60,
          min_score: test.min_score || 70,
          max_attempts: test.max_attempts || 3
        }));

        console.log('Tests to insert:', testsToInsert);

        const { data: insertedTests, error: insertError } = await supabase
          .from('event_pronunciation_tests')
          .insert(testsToInsert)
          .select();

        if (insertError) {
          console.error('Error inserting tests:', insertError);
          throw insertError;
        }

        console.log('Successfully inserted tests:', insertedTests);
      }

      // Refresh event details
      fetchEventDetails(selectedEvent.id);
      showToast.success('Tes pengucapan berhasil diperbarui');
      setIsTestDialogOpen(false);
    } catch (error) {
      console.error('Error updating tests:', error);
      showToast.error('Gagal memperbarui tes pengucapan: ' + error.message);
    }
  };
  
  const handleSubmitEvent = async (formData, rewardsData) => {
    try {
      setIsSubmitting(true);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        speaker: formData.speaker,
        speaker_title: formData.speakerTitle,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      let eventId;
      
      if (editingEvent) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
          .select();
          
        if (error) throw error;
        result = data;
        eventId = editingEvent.id;
        showToast.success('Event berhasil diperbarui');
      } else {
        // Create new event
        eventData.created_at = new Date().toISOString();
        eventData.created_by = localStorage.getItem('teacherId') || localStorage.getItem('userId');
        
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select();
          
        if (error) throw error;
        result = data;
        eventId = result[0]?.id;
        showToast.success('Event baru berhasil ditambahkan');
      }
      
      // Handle rewards data
      if (rewardsData && rewardsData.length > 0 && eventId) {
        // Delete existing rewards for this event (if editing)
        if (editingEvent) {
          await supabase
            .from('event_rewards')
            .delete()
            .eq('event_id', eventId);
        }
        
        // Insert new/updated rewards
        const rewardsToInsert = rewardsData
          .filter(reward => reward.min_score >= 0) // Only include valid rewards
          .map(reward => ({
            event_id: eventId,
            min_score: parseInt(reward.min_score) || 0,
            xp_reward: parseInt(reward.xp_reward) || 0,
            points_reward: parseInt(reward.points_reward) || 0,
            badge_reward: reward.badge_reward || null,
            special_reward: reward.special_reward || null,
            created_at: new Date().toISOString()
          }));
          
        if (rewardsToInsert.length > 0) {
          const { error: rewardsError } = await supabase
            .from('event_rewards')
            .insert(rewardsToInsert);
            
          if (rewardsError) {
            console.error('Error saving rewards:', rewardsError);
            showToast.warning('Event disimpan tetapi ada masalah dengan rewards');
          }
        }
      }
      
      setIsModalOpen(false);
      fetchEvents();
      
      // Return the event ID in case we need it
      return eventId;
      
    } catch (err) {
      console.error('Error saving event:', err);
      showToast.error('Gagal menyimpan event: ' + err.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
        Error loading events: {error}
      </div>
    );
  }

  // Event Detail Modal Component
  const EventDetailModal = ({ event, isOpen, onClose, details, loading, onEditTests }) => {
    if (!isOpen || !event) return null;

    const formatDate = (dateString) => {
      if (!dateString) return 'Invalid Date';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    return (
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-blue-100 mt-2 text-sm">{event.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {formatDate(event.date)}
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    event.status === 'active' ? 'bg-green-500' : 
                    event.status === 'upcoming' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}>
                    {event.status === 'active' ? 'Aktif' : 
                     event.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat detail event...</span>
              </div>
            ) : (
              <div className="p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <IconUsers className="mx-auto mb-2 text-blue-600" size={24} />
                    <div className="text-2xl font-bold text-blue-600">{details.participants.length}</div>
                    <div className="text-sm text-gray-600">Peserta</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <IconTrophy className="mx-auto mb-2 text-green-600" size={24} />
                    <div className="text-2xl font-bold text-green-600">{details.results.length}</div>
                    <div className="text-sm text-gray-600">Selesai</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <IconGift className="mx-auto mb-2 text-purple-600" size={24} />
                    <div className="text-2xl font-bold text-purple-600">{details.rewards.length}</div>
                    <div className="text-sm text-gray-600">Reward</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <IconMicrophone className="mx-auto mb-2 text-orange-600" size={24} />
                    <div className="text-2xl font-bold text-orange-600">{details.tests.length}</div>
                    <div className="text-sm text-gray-600">Tes Suara</div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Participants Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <IconUsers size={20} />
                      Daftar Peserta
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {details.participants.length > 0 ? (
                        details.participants.map((participant) => (
                          <div key={participant.id} className="bg-white p-3 rounded border">
                            <div className="font-medium">
                              {participant.users?.profiles?.name || 'Nama tidak tersedia'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {participant.users?.email} • {participant.users?.profiles?.school_name || 'Sekolah tidak tersedia'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Daftar: {formatDate(participant.registered_at)} • 
                              Status: <span className={participant.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
                                {participant.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Belum ada peserta yang terdaftar
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <IconTrophy size={20} />
                      Leaderboard
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {details.results.length > 0 ? (
                        details.results.map((result, index) => (
                          <div key={result.id} className="bg-white p-3 rounded border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                index === 2 ? 'bg-orange-100 text-orange-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {result.users?.profiles?.name || 'Nama tidak tersedia'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {result.users?.profiles?.school_name || 'Sekolah tidak tersedia'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{result.total_score}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(result.completed_at)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Belum ada hasil yang tersedia
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rewards Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <IconGift size={20} />
                      Sistem Reward
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {details.rewards.length > 0 ? (
                        details.rewards.map((reward) => (
                          <div key={reward.id} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">Skor Minimum: {reward.min_score}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {reward.xp_reward && (
                                    <span className="inline-block bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs mr-2">
                                      {reward.xp_reward} XP
                                    </span>
                                  )}
                                  {reward.points_reward && (
                                    <span className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                                      {reward.points_reward} Poin
                                    </span>
                                  )}
                                  {reward.badge_reward && (
                                    <span className="inline-block bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs mr-2">
                                      Badge: {reward.badge_reward}
                                    </span>
                                  )}
                                  {reward.special_reward && (
                                    <span className="inline-block bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                                      {reward.special_reward}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Belum ada reward yang dikonfigurasi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tests Section with Edit Functionality */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <IconMicrophone size={20} />
                        Tes Pengucapan
                      </h3>
                      <button
                        onClick={() => onEditTests(event)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <IconEdit size={16} />
                        Edit Soal
                      </button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {details.tests.length > 0 ? (
                        details.tests.map((test) => (
                          <div key={test.id} className="bg-white p-3 rounded border">
                            <div className="font-medium">{test.surah_name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Ayat {test.ayah_start} - {test.ayah_end}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Durasi: {test.duration_seconds}s • 
                              Min. Score: {test.min_score} • 
                              Max. Attempts: {test.max_attempts}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Belum ada tes pengucapan yang dikonfigurasi
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                showToast.info('Fitur tambah soal akan segera hadir');
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              + Tambah Soal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div className="text-sm text-gray-600">
              Event ID: {event.id} • Dibuat: {formatDate(event.created_at)}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  onClose();
                  setEditingEvent(event);
                  setIsModalOpen(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <IconEdit size={16} />
                Edit Event
              </button>
              <button 
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <IconCalendarEvent size={20} />
          Manajemen Event
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchEvents()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg flex items-center transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={() => {
              setEditingEvent(null); 
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <IconPlus size={16} />
            Tambah Event
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada event yang tersedia</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="px-4 py-3">Nama Event</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Tanggal & Waktu</th>
                <th className="px-4 py-3">Speaker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event, index) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-800">{event.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description || 'Tidak ada deskripsi'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{getEventTypeText(event.type)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-gray-600">{formatDate(event.date)}</div>
                      <div className="text-xs text-gray-500">{event.time ? formatTime(event.time) : '-'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {event.speaker ? (
                      <div>
                        <div className="text-gray-600">{event.speaker}</div>
                        {event.speaker_title && <div className="text-xs text-gray-500">{event.speaker_title}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg flex items-center">
                        <IconUserCheck size={14} className="mr-1" /> 
                        {event.registrationCount}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg flex items-center">
                        <IconUsers size={14} className="mr-1" />
                        {event.resultCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleViewEvent(event)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Lihat Detail Event"
                      >
                        <IconEye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Event"
                      >
                        <IconEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Event"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Event Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <EventFormModal 
              event={editingEvent} 
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmitEvent}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        </div>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
          setEventDetails({
            participants: [],
            rewards: [],
            tests: [],
            results: []
          });
        }}
        details={eventDetails}
        loading={loadingDetails}
        onEditTests={handleEditTests}
      />

      {/* Test Edit Dialog */}
      <TestEditDialog 
        isOpen={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
        tests={editingTests}
        onSubmit={handleSubmitTests}
        eventData={selectedEvent}
      />
    </div>
  );
};

// Modal component for event form
const EventFormModal = ({ event, onClose, onSubmit, isSubmitting }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'seminar',
    date: event?.date || new Date().toISOString().split('T')[0],
    time: event?.time || '09:00:00',
    status: event?.status || 'upcoming',
    speaker: event?.speaker || '',
    speakerTitle: event?.speaker_title || '',
  });
  
  // Rewards data state
  const [rewardsData, setRewardsData] = useState([
    {
      id: null,
      min_score: 80,
      xp_reward: 100,
      points_reward: 50,
      badge_reward: '',
      special_reward: ''
    }
  ]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  
  // Pronunciation tests data state
  const [testsData, setTestsData] = useState([
    {
      id: null,
      surah_name: 'Al-Fatihah',
      ayah_start: 1,
      ayah_end: 7,
      duration_seconds: 120,
      min_score: 80,
      max_attempts: 3
    }
  ]);
  const [loadingTests, setLoadingTests] = useState(false);
  
  // Fetch existing rewards and tests when editing an event
  useEffect(() => {
    if (event?.id) {
      fetchEventRewards();
      fetchEventTests();
    }
  }, [event?.id]);
  
  const fetchEventRewards = async () => {
    try {
      setLoadingRewards(true);
      const { data, error } = await supabase
        .from('event_rewards')
        .select('*')
        .eq('event_id', event.id)
        .order('min_score', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setRewardsData(data);
      }
    } catch (error) {
      console.error('Error fetching event rewards:', error);
    } finally {
      setLoadingRewards(false);
    }
  };
  
  const fetchEventTests = async () => {
    try {
      setLoadingTests(true);
      const { data, error } = await supabase
        .from('event_pronunciation_tests')
        .select('*')
        .eq('event_id', event.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTestsData(data);
      }
    } catch (error) {
      console.error('Error fetching event tests:', error);
    } finally {
      setLoadingTests(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRewardChange = (index, field, value) => {
    setRewardsData(prev => prev.map((reward, i) => 
      i === index ? { ...reward, [field]: value } : reward
    ));
  };
  
  const addRewardTier = () => {
    setRewardsData(prev => [...prev, {
      id: null,
      min_score: 0,
      xp_reward: 0,
      points_reward: 0,
      badge_reward: '',
      special_reward: ''
    }]);
  };
  
  const removeRewardTier = (index) => {
    if (rewardsData.length > 1) {
      setRewardsData(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  // Test handling functions
  const handleTestChange = (index, field, value) => {
    setTestsData(prev => prev.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    ));
  };
  
  const addTestItem = () => {
    setTestsData(prev => [...prev, {
      id: null,
      surah_name: '',
      ayah_start: 1,
      ayah_end: 1,
      duration_seconds: 60,
      min_score: 70,
      max_attempts: 3
    }]);
  };
  
  const removeTestItem = (index) => {
    if (testsData.length > 1) {
      setTestsData(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentPage === 1) {
      // Move to rewards page
      setCurrentPage(2);
      return;
    } else if (currentPage === 2) {
      // Move to tests page
      setCurrentPage(3);
      return;
    }
    
    // Submit event data, rewards, and tests
    const result = await onSubmit(formData, rewardsData, testsData);
    if (result) {
      onClose();
    }
  };
  
  const handlePrevious = () => {
    if (currentPage === 3) {
      setCurrentPage(2);
    } else if (currentPage === 2) {
      setCurrentPage(1);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Tambah Event Baru'}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentPage === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              1. Info Event
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentPage === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              2. Rewards
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentPage === 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              3. Tes Pengucapan
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {currentPage === 1 ? (
          // Page 1: Event Information
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nama Event*</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tipe Event*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="competition">Kompetisi</option>
                  <option value="exam">Ujian</option>
                  <option value="pronunciation_test">Tes Pengucapan</option>
                  <option value="reading_test">Tes Membaca</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tanggal*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Waktu*</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time ? formData.time.slice(0, 5) : ''}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="upcoming">Akan Datang</option>
                  <option value="ongoing">Berlangsung</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pembicara</label>
                <input
                  type="text"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama pembicara (opsional)"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Jabatan Pembicara</label>
                <input
                  type="text"
                  name="speakerTitle"
                  value={formData.speakerTitle}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jabatan atau gelar pembicara (opsional)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Deskripsi event"
              ></textarea>
            </div>
          </>
        ) : currentPage === 2 ? (
          // Page 2: Event Rewards
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Pengaturan Rewards Event</h3>
                <button
                  type="button"
                  onClick={addRewardTier}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <span>+</span> Tambah Tier
                </button>
              </div>
              
              {loadingRewards ? (
                <div className="text-center py-4">
                  <RefreshCw size={20} className="animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-gray-500 mt-2">Memuat data rewards...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {rewardsData.map((reward, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-700">Tier Reward #{index + 1}</h4>
                        {rewardsData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRewardTier(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Min Score*</label>
                          <input
                            type="number"
                            value={reward.min_score}
                            onChange={(e) => handleRewardChange(index, 'min_score', e.target.value)}
                            min="0"
                            max="100"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="80"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">XP Reward</label>
                          <input
                            type="number"
                            value={reward.xp_reward}
                            onChange={(e) => handleRewardChange(index, 'xp_reward', e.target.value)}
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="100"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Points Reward</label>
                          <input
                            type="number"
                            value={reward.points_reward}
                            onChange={(e) => handleRewardChange(index, 'points_reward', e.target.value)}
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="50"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Badge Reward</label>
                          <input
                            type="text"
                            value={reward.badge_reward}
                            onChange={(e) => handleRewardChange(index, 'badge_reward', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nama badge (opsional)"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Special Reward</label>
                          <input
                            type="text"
                            value={reward.special_reward}
                            onChange={(e) => handleRewardChange(index, 'special_reward', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Reward khusus (opsional)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // Page 3: Pronunciation Tests
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">Pengaturan Tes Pengucapan</h3>
                <button
                  type="button"
                  onClick={addTestItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                >
                  <span>+</span> Tambah Soal
                </button>
              </div>
              
              {loadingTests ? (
                <div className="text-center py-4">
                  <RefreshCw size={20} className="animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-gray-500 mt-2">Memuat data tes...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {testsData.length > 0 ? (
                    testsData.map((test, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Soal Tes #{index + 1}</h4>
                          {testsData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTestItem(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Nama Surah*</label>
                            <input
                              type="text"
                              value={test.surah_name}
                              onChange={(e) => handleTestChange(index, 'surah_name', e.target.value)}
                              required
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Al-Fatihah"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Durasi (detik)*</label>
                            <input
                              type="number"
                              value={test.duration_seconds}
                              onChange={(e) => handleTestChange(index, 'duration_seconds', e.target.value)}
                              min="30"
                              max="600"
                              required
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="120"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Ayat Mulai*</label>
                            <input
                              type="number"
                              value={test.ayah_start}
                              onChange={(e) => handleTestChange(index, 'ayah_start', e.target.value)}
                              min="1"
                              required
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Ayat Selesai*</label>
                            <input
                              type="number"
                              value={test.ayah_end}
                              onChange={(e) => handleTestChange(index, 'ayah_end', e.target.value)}
                              min="1"
                              required
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="7"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Min Score*</label>
                            <input
                              type="number"
                              value={test.min_score}
                              onChange={(e) => handleTestChange(index, 'min_score', e.target.value)}
                              min="0"
                              max="100"
                              required
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="80"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Max Attempts</label>
                            <input
                              type="number"
                              value={test.max_attempts}
                              onChange={(e) => handleTestChange(index, 'max_attempts', e.target.value)}
                              min="1"
                              max="10"
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="3"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>Belum ada tes pengucapan yang dikonfigurasi</p>
                      <button
                        type="button"
                        onClick={addTestItem}
                        className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        + Tambah Soal Pertama
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div>
            {currentPage === 2 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                ← Sebelumnya
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : currentPage === 1 ? (
                <span>Selanjutnya →</span>
              ) : (
                <span>{event ? 'Update Event' : 'Simpan Event'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Test Edit Dialog Component
const TestEditDialog = ({ isOpen, onClose, tests, onSubmit, eventData }) => {
  const [editingTests, setEditingTests] = useState([]);

  useEffect(() => {
    setEditingTests(tests || []);
  }, [tests]);

  const handleAddTest = () => {
    setEditingTests([...editingTests, {
      surah_name: 'Al-Fatihah',
      ayah_start: 1,
      ayah_end: 7,
      duration_seconds: 60,
      min_score: 70,
      max_attempts: 3
    }]);
  };

  const handleUpdateTest = (index, field, value) => {
    const updated = editingTests.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    );
    setEditingTests(updated);
  };

  const handleRemoveTest = (index) => {
    const updated = editingTests.filter((_, i) => i !== index);
    setEditingTests(updated);
  };

  const handleSubmit = () => {
    onSubmit(editingTests);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <IconMicrophone size={24} />
              Edit Tes Pengucapan: {eventData?.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconX size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {editingTests.map((test, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <IconMicrophone size={16} />
                    Soal Tes {index + 1}
                  </h3>
                  <button
                    onClick={() => handleRemoveTest(index)}
                    className="text-red-600 hover:text-red-700 p-1 rounded"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Surah
                    </label>
                    <input
                      type="text"
                      value={test.surah_name}
                      onChange={(e) => handleUpdateTest(index, 'surah_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama surah"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ayat Mulai
                    </label>
                    <input
                      type="number"
                      value={test.ayah_start}
                      onChange={(e) => handleUpdateTest(index, 'ayah_start', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ayat Selesai
                    </label>
                    <input
                      type="number"
                      value={test.ayah_end}
                      onChange={(e) => handleUpdateTest(index, 'ayah_end', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi (detik)
                    </label>
                    <input
                      type="number"
                      value={test.duration_seconds}
                      onChange={(e) => handleUpdateTest(index, 'duration_seconds', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skor Minimum
                    </label>
                    <input
                      type="number"
                      value={test.min_score}
                      onChange={(e) => handleUpdateTest(index, 'min_score', parseInt(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maksimal Percobaan
                    </label>
                    <input
                      type="number"
                      value={test.max_attempts}
                      onChange={(e) => handleUpdateTest(index, 'max_attempts', parseInt(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleAddTest}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <IconPlus size={16} />
              Tambah Soal Tes
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <IconCheck size={16} />
              Simpan Soal Tes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventManagement;
