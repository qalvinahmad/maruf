import { useState } from 'react';

export const useDailyDialogs = () => {
  const [dailyDialogQueue, setDailyDialogQueue] = useState([]);
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [isProcessingDailyDialogs, setIsProcessingDailyDialogs] = useState(false);
  
  // Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const [showEnergyDialog, setShowEnergyDialog] = useState(false);

  const handleDailyDialogs = (showWelcome, showStreak, showEnergy) => {
    const dialogs = [];
    
    if (showWelcome) dialogs.push('welcome');
    if (showStreak) dialogs.push('streak');
    if (showEnergy) dialogs.push('energy');
    
    setDailyDialogQueue(dialogs);
    setCurrentDialogIndex(0);
    setIsProcessingDailyDialogs(true);
    
    // Show first dialog if any
    if (dialogs.length > 0) {
      const firstDialog = dialogs[0];
      switch (firstDialog) {
        case 'welcome':
          setIsModalOpen(true);
          break;
        case 'streak':
          setShowStreakDialog(true);
          break;
        case 'energy':
          setShowEnergyDialog(true);
          break;
      }
    }
  };

  const handleDialogClose = (dialogType) => {
    console.log(`Closing dialog: ${dialogType}`);
    
    if (!isProcessingDailyDialogs || dailyDialogQueue.length === 0) {
      return;
    }
    
    const nextIndex = currentDialogIndex + 1;
    
    if (nextIndex < dailyDialogQueue.length) {
      setCurrentDialogIndex(nextIndex);
      const nextDialog = dailyDialogQueue[nextIndex];
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        switch (nextDialog) {
          case 'welcome':
            setIsModalOpen(true);
            break;
          case 'streak':
            setShowStreakDialog(true);
            break;
          case 'energy':
            setShowEnergyDialog(true);
            break;
        }
      }, 300);
    } else {
      // All dialogs completed
      setIsProcessingDailyDialogs(false);
      setDailyDialogQueue([]);
      setCurrentDialogIndex(0);
    }
  };

  const handleDailyTasks = async (userId, updateStreak, updateEnergy) => {
    try {
      console.log('🔥 Handling daily tasks for user:', userId);
      
      let showWelcome = false;
      let showStreak = false;
      let showEnergy = false;
      
      // Welcome dialog logic
      const lastWelcomeKey = 'lastWelcomeShown';
      const lastWelcome = localStorage.getItem(lastWelcomeKey);
      const today = new Date().toDateString();
      if (lastWelcome !== today) {
        showWelcome = true;
        localStorage.setItem(lastWelcomeKey, today);
      }
      
      // Streak dialog logic
      const lastStreakKey = `lastStreak_${userId}`;
      const lastStreakDate = localStorage.getItem(lastStreakKey);
      if (lastStreakDate !== today) {
        showStreak = true;
        localStorage.setItem(lastStreakKey, today);
        await updateStreak(userId);
      }
      
      // Energy dialog logic
      const lastEnergyKey = `lastEnergy_${userId}`;
      const lastEnergyDate = localStorage.getItem(lastEnergyKey);
      if (lastEnergyDate !== today) {
        showEnergy = true;
        localStorage.setItem(lastEnergyKey, today);
        await updateEnergy(userId, 2);
      }
      
      handleDailyDialogs(showWelcome, showStreak, showEnergy);
    } catch (error) {
      console.error('Error handling daily tasks:', error);
    }
  };

  return {
    // Dialog states
    isModalOpen,
    setIsModalOpen,
    showStreakDialog,
    setShowStreakDialog,
    showEnergyDialog,
    setShowEnergyDialog,
    
    // Dialog management
    handleDailyDialogs,
    handleDialogClose,
    handleDailyTasks,
    
    // Queue states
    dailyDialogQueue,
    currentDialogIndex,
    isProcessingDailyDialogs
  };
};
