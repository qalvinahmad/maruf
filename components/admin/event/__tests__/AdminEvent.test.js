// Test configuration for modular AdminEvent components
import { jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock dependencies
jest.mock('../../../hooks/useAdminEventData', () => ({
  useAdminEventData: () => ({
    events: [
      {
        id: 1,
        title: 'Test Event',
        type: 'Kegiatan',
        status: 'Aktif',
        date: '2025-01-16',
        description: 'Test description'
      }
    ],
    statistics: {
      totalEvents: 1,
      totalAnnouncements: 0,
      totalChallenges: 0,
      totalRegistrations: 0
    },
    isLoading: false,
    activeTab: 'events',
    setActiveTab: jest.fn(),
    typeFilter: 'all',
    setTypeFilter: jest.fn(),
    statusFilter: 'all',
    setStatusFilter: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn()
  })
}));

jest.mock('../../../utils/adminEventUtils', () => ({
  getFilterOptions: () => ({
    type: [
      { value: 'all', label: 'Semua Tipe' },
      { value: 'Kegiatan', label: 'Kegiatan' }
    ],
    status: [
      { value: 'all', label: 'Semua Status' },
      { value: 'Aktif', label: 'Aktif' }
    ]
  }),
  createEventHandlers: () => ({
    handleAddEvent: jest.fn(),
    handleEditEvent: jest.fn(),
    handleDeleteEvent: jest.fn()
  })
}));

// Component Tests
describe('AdminEvent Modular Components', () => {
  describe('HeroSection', () => {
    test('renders hero section with correct title', () => {
      const { HeroSection } = require('../../../components/admin/event/HeroSection');
      render(<HeroSection />);
      expect(screen.getByText('Manajemen Event')).toBeInTheDocument();
    });
  });

  describe('StatisticsCards', () => {
    test('displays statistics correctly', () => {
      const { StatisticsCards } = require('../../../components/admin/event/StatisticsCards');
      const mockStats = {
        totalEvents: 5,
        totalAnnouncements: 3,
        totalChallenges: 2,
        totalRegistrations: 10
      };
      
      render(<StatisticsCards statistics={mockStats} />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('TabNavigation', () => {
    test('switches tabs correctly', () => {
      const { TabNavigation } = require('../../../components/admin/event/TabNavigation');
      const mockSetActiveTab = jest.fn();
      
      render(<TabNavigation activeTab="events" setActiveTab={mockSetActiveTab} />);
      
      const announcementsTab = screen.getByText('Pengumuman');
      fireEvent.click(announcementsTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledWith('announcements');
    });
  });

  describe('EventTable', () => {
    test('renders events and handles actions', () => {
      const { EventTable } = require('../../../components/admin/event/EventTable');
      const mockHandlers = {
        handleAddEvent: jest.fn(),
        handleEditEvent: jest.fn(),
        handleDeleteEvent: jest.fn()
      };
      
      const mockEvents = [
        {
          id: 1,
          title: 'Test Event',
          type: 'Kegiatan',
          status: 'Aktif',
          date: '2025-01-16'
        }
      ];
      
      render(<EventTable events={mockEvents} {...mockHandlers} />);
      
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      
      const addButton = screen.getByText('Tambah Event');
      fireEvent.click(addButton);
      
      expect(mockHandlers.handleAddEvent).toHaveBeenCalled();
    });
  });

  describe('FilterSection', () => {
    test('handles filter changes', () => {
      const { FilterSection } = require('../../../components/admin/event/FilterSection');
      const mockSetters = {
        setTypeFilter: jest.fn(),
        setStatusFilter: jest.fn(),
        setSearchTerm: jest.fn()
      };
      
      const filterOptions = {
        type: [
          { value: 'all', label: 'Semua Tipe' },
          { value: 'Kegiatan', label: 'Kegiatan' }
        ],
        status: [
          { value: 'all', label: 'Semua Status' },
          { value: 'Aktif', label: 'Aktif' }
        ]
      };
      
      render(
        <FilterSection 
          filterOptions={filterOptions}
          typeFilter="all"
          statusFilter="all"
          searchTerm=""
          {...mockSetters}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Cari event...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(mockSetters.setSearchTerm).toHaveBeenCalledWith('test search');
    });
  });
});

// Integration Tests
describe('AdminEvent Integration', () => {
  test('complete workflow: load, filter, add event', async () => {
    const { default: AdminEventModular } = require('../../../pages/dashboard/admin/event/AdminEventModular');
    
    render(<AdminEventModular />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check if main components are rendered
    expect(screen.getByText('Manajemen Event')).toBeInTheDocument();
    expect(screen.getByText('Event Tahunan')).toBeInTheDocument();
    expect(screen.getByText('Tambah Event')).toBeInTheDocument();
  });
});

// Performance Tests
describe('AdminEvent Performance', () => {
  test('components render within acceptable time', () => {
    const start = performance.now();
    
    const { StatisticsCards } = require('../../../components/admin/event/StatisticsCards');
    render(<StatisticsCards statistics={{ totalEvents: 100 }} />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
});

export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ]
};
