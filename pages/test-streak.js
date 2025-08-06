import StreakDialogHuruf from '../components/dialog/StreakDialogHuruf';

const TestStreakDialog = () => {
  const mockProfileData = {
    id: 'test-id',
    streak: 5
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Test Streak Dialog</h1>
        <button 
          onClick={() => {
            // Test dialog functionality
            console.log('Testing streak dialog...');
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Open Streak Dialog
        </button>
        
        {/* Always show dialog for testing */}
        <StreakDialogHuruf
          isOpen={true}
          onClose={() => console.log('Dialog closed')}
          profileData={mockProfileData}
        />
      </div>
    </div>
  );
};

export default TestStreakDialog;
