import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, DollarSign, CheckCircle, Clock, 
  TrendingUp, FileText, X, Target, Folder, Edit, Receipt
} from '../Icons';
import { useFetcher, useRevalidator, useNavigation } from '@remix-run/react';
import { BudgetManager } from '../budget';
import { ExpenseTracker } from '../expenses';
import { StrategicGoals } from '../StrategicGoals';
import { EventDocuments } from './EventDocuments';
import { EventNotes } from './EventNotes';
import { api } from '~/lib/api';
import type { EventWithDetails, VendorWithStats, ExpenseWithVendor, StrategicGoal } from "~/types";
import type { User } from "~/lib/auth";
import type { EventStatus } from "~/types";
import { Dropdown } from '../shared';

// Types for event files and notes
type EventFile = {
  id: string;
  name: string;
  type: string;
  size?: number;
  uploadedAt: string;
  uploadedBy?: string;
  url?: string;
};

type EventNote = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
};

interface EventDetailsModalProps {
  event: EventWithDetails;
  organization?: { name?: string; members?: Array<{ id: string; name: string }> } | null;
  onClose: () => void;
  onUpdate: (data: Partial<EventWithDetails>) => Promise<void>;
  isDemo?: boolean;
  user?: User | null;
  vendors?: VendorWithStats[];
  expenses?: ExpenseWithVendor[];
  actionData?: { success?: boolean; error?: string; message?: string } | null;
}

export function EventDetailsModal({
  event,
  organization,
  onClose,
  onUpdate,
  isDemo = false,
  user,
  vendors = [],
  expenses: initialExpenses = [],
  actionData,
}: EventDetailsModalProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [fullEvent, setFullEvent] = useState<EventWithDetails>(event);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventUsers, setEventUsers] = useState<any[]>([]);
  const [eventVendors, setEventVendors] = useState<VendorWithStats[]>(vendors);
  const [eventExpenses, setEventExpenses] = useState<ExpenseWithVendor[]>(initialExpenses);
  const [eventBudgetItems, setEventBudgetItems] = useState<any[]>(event?.budgetItems || []);
  const [eventStrategicGoals, setEventStrategicGoals] = useState<StrategicGoal[]>(event?.strategicGoals || []);
  const [eventFiles, setEventFiles] = useState<EventFile[]>(event?.files || []);
  const [eventNotes, setEventNotes] = useState<EventNote[]>(event?.notes || []);
  // Normalize status: backend returns capitalized (Planning, Active, etc.), but we use lowercase for internal state
  const normalizeStatus = (status: string | undefined): string => {
    if (!status) return 'planning';
    return status.toLowerCase();
  };
  const [status, setStatus] = useState<string>(normalizeStatus(event.status));
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const navigation = useNavigation();
  
  // Track if we've done initial load to avoid reloading unnecessarily
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Fetch full event details (including budgetItems and expenses) when component mounts or event changes
  useEffect(() => {
    if (!isDemo && event?.id && !hasInitialLoad) {
      // Always load event details to get expenses, budgetItems, and other data
      setLoadingEvent(true);
      fetcher.load(`/events/${event.id}`);
      setHasInitialLoad(true);
    } else if (event?.id) {
      // Update with event data
      setFullEvent(event);
      setLoadingEvent(false);
    }
  }, [event?.id, isDemo, hasInitialLoad]);
  
  // Update fullEvent when event prop changes (for budgetItems updates)
  useEffect(() => {
    if (event && event.id === fullEvent?.id) {
      // Only update if it's the same event (to avoid overwriting with stale data)
      // Check if event has more recent data (more budgetItems or strategicGoals)
      const eventHasMoreData = 
        (event.budgetItems?.length || 0) > (fullEvent.budgetItems?.length || 0) ||
        (event.strategicGoals?.length || 0) > (fullEvent.strategicGoals?.length || 0);
      
      if (eventHasMoreData || event.budgetItems?.length !== fullEvent.budgetItems?.length) {
        setFullEvent(event);
      }
    }
  }, [event?.budgetItems?.length, event?.id, fullEvent?.id, fullEvent?.budgetItems?.length, event?.strategicGoals?.length, fullEvent?.strategicGoals?.length]);
  
  // Update vendors when prop changes
  useEffect(() => {
    if (vendors && vendors.length > 0) {
      setEventVendors(vendors);
    }
  }, [vendors]);

  // Update expenses when prop changes - use ref to prevent unnecessary updates
  const prevExpensesRef = useRef<ExpenseWithVendor[]>(initialExpenses);
  useEffect(() => {
    if (initialExpenses) {
      // Only update if expenses actually changed (different IDs or length)
      const prevIds = prevExpensesRef.current.map(e => e.id).sort().join(',');
      const newIds = initialExpenses.map(e => e.id).sort().join(',');
      
      if (prevIds !== newIds || prevExpensesRef.current.length !== initialExpenses.length) {
        setEventExpenses(initialExpenses);
        prevExpensesRef.current = initialExpenses;
      }
    }
  }, [initialExpenses]);

  // Update budgetItems when event prop changes - use ref to prevent unnecessary updates
  const prevBudgetItemsRef = useRef<any[]>(event?.budgetItems || []);
  useEffect(() => {
    const currentBudgetItems = event?.budgetItems || [];
    // Always check for changes, even if array is empty
    const prevIds = prevBudgetItemsRef.current.map((item: any) => item.id).sort().join(',');
    const newIds = currentBudgetItems.map((item: any) => item.id).sort().join(',');

    if (prevIds !== newIds || prevBudgetItemsRef.current.length !== currentBudgetItems.length) {
      setEventBudgetItems(currentBudgetItems);
      prevBudgetItemsRef.current = currentBudgetItems;
    }
  }, [event?.budgetItems]);

  // Update strategicGoals when event prop changes - use ref to prevent unnecessary updates
  const prevStrategicGoalsRef = useRef<StrategicGoal[]>(event?.strategicGoals || []);
  useEffect(() => {
    const currentStrategicGoals = event?.strategicGoals || [];
    // Always check for changes, even if array is empty
    const prevIds = prevStrategicGoalsRef.current.map((goal: StrategicGoal) => goal.id).sort().join(',');
    const newIds = currentStrategicGoals.map((goal: StrategicGoal) => goal.id).sort().join(',');

    if (prevIds !== newIds || prevStrategicGoalsRef.current.length !== currentStrategicGoals.length) {
      setEventStrategicGoals(currentStrategicGoals);
      prevStrategicGoalsRef.current = currentStrategicGoals;
    }
  }, [event?.strategicGoals]);

  // Update files when event prop changes - same pattern as expenses
  const prevFilesRef = useRef<EventFile[]>(event?.files || []);
  useEffect(() => {
    const currentFiles = event?.files || [];
    // Always check for changes, even if array is empty
    const prevIds = prevFilesRef.current.map((file: EventFile) => file.id).sort().join(',');
    const newIds = currentFiles.map((file: EventFile) => file.id).sort().join(',');

    if (prevIds !== newIds || prevFilesRef.current.length !== currentFiles.length) {
      setEventFiles(currentFiles);
      prevFilesRef.current = currentFiles;
    }
  }, [event?.files]);

  // Update notes when event prop changes - same pattern as expenses
  const prevNotesRef = useRef<EventNote[]>(event?.notes || []);
  useEffect(() => {
    const currentNotes = event?.notes || [];
    // Always check for changes, even if array is empty
    const prevIds = prevNotesRef.current.map((note: EventNote) => note.id).sort().join(',');
    const newIds = currentNotes.map((note: EventNote) => note.id).sort().join(',');

    if (prevIds !== newIds || prevNotesRef.current.length !== currentNotes.length) {
      setEventNotes(currentNotes);
      prevNotesRef.current = currentNotes;
    }
  }, [event?.notes]);

  // Track previous revalidator and navigation states to detect transitions
  const prevRevalidatorState = useRef(revalidator.state);
  const prevNavigationState = useRef(navigation.state);
  const lastRefreshTime = useRef<number>(0);
  const isRefreshingRef = useRef(false);
  
  // Refresh event data when route revalidates (after form submissions that redirect)
  // This handles cases where BudgetManager or other components submit via Form (not fetcher)
  useEffect(() => {
    // Prevent infinite loops - don't refresh if already refreshing
    if (isRefreshingRef.current || !hasInitialLoad || isDemo || !event?.id || loadingEvent) {
      prevRevalidatorState.current = revalidator.state;
      prevNavigationState.current = navigation.state;
      return;
    }

    // Detect when revalidator transitions from loading/idle to idle (revalidation complete)
    const revalidatorJustCompleted = 
      prevRevalidatorState.current !== 'idle' && 
      revalidator.state === 'idle';
    
    // Also detect when navigation completes (form submission finished)
    const navigationJustCompleted = 
      prevNavigationState.current === 'submitting' && 
      navigation.state === 'idle';
    
    prevRevalidatorState.current = revalidator.state;
    prevNavigationState.current = navigation.state;
    
    // Throttle refreshes to avoid too many requests (max once per 2 seconds)
    const now = Date.now();
    const shouldRefresh = 
      (revalidatorJustCompleted || navigationJustCompleted) && 
      fetcher.state === 'idle' &&
      (now - lastRefreshTime.current > 2000);
    
    if (shouldRefresh) {
      lastRefreshTime.current = now;
      isRefreshingRef.current = true;
      fetcher.load(`/events/${event.id}`);
      // Reset refreshing flag immediately after load starts
      isRefreshingRef.current = false;
    }
  }, [revalidator.state, navigation.state, event?.id, isDemo, hasInitialLoad, loadingEvent]);
  
  // Also refresh when actionData indicates success (for budget item operations)
  useEffect(() => {
    if (actionData?.success && hasInitialLoad && !isDemo && event?.id && !loadingEvent && !isRefreshingRef.current) {
      const now = Date.now();
      if (now - lastRefreshTime.current > 2000 && fetcher.state === 'idle') {
        lastRefreshTime.current = now;
        isRefreshingRef.current = true;
        fetcher.load(`/events/${event.id}`);
        // Reset refreshing flag immediately after load starts
        isRefreshingRef.current = false;
      }
    }
  }, [actionData?.success, hasInitialLoad, isDemo, event?.id, loadingEvent]);

  // Handle fetcher response - both for loading and for action submissions
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as any;
      console.log('🔄 EventDetailsModal - Fetcher data received:', {
        hasData: !!data,
        hasEvent: data && typeof data === 'object' && 'event' in data,
        dataKeys: data ? Object.keys(data) : [],
      });

      if (data && typeof data === 'object' && 'event' in data) {
        // The route loader returns { event, users, vendors, expenses, user }
        // Ensure we preserve all event data including budgetItems and strategicGoals
        const fetchedEvent = data.event as EventWithDetails;
        console.log('📋 EventDetailsModal - Fetched Event Keys:', {
          eventId: fetchedEvent.id,
          eventKeys: Object.keys(fetchedEvent),
          hasFiles: 'files' in fetchedEvent,
          hasNotes: 'notes' in fetchedEvent,
          hasBudgetItems: 'budgetItems' in fetchedEvent,
          hasStrategicGoals: 'strategicGoals' in fetchedEvent,
        });

        setFullEvent(fetchedEvent);
        if (data.users) setEventUsers(data.users);
        if (data.vendors) setEventVendors(data.vendors);

        // Update expenses - always update when available (same pattern as transactions)
        if (data.expenses) {
          console.log('💳 EventDetailsModal - Expenses Updated:', {
            eventId: fetchedEvent.id,
            expensesCount: data.expenses.length,
            expenses: data.expenses,
          });
          setEventExpenses(data.expenses);
        }

        // Update files - same pattern as expenses (from separate field, not from event object)
        if (data.files !== undefined) {
          console.log('📁 EventDetailsModal - Files Updated from data.files:', {
            eventId: fetchedEvent.id,
            filesCount: (data.files || []).length,
            files: data.files || [],
          });
          setEventFiles(data.files || []);
        }

        // Update budgetItems - always update when available (same pattern as transactions)
        // Always update, even if empty array, to ensure we have the latest data
        const budgetItems = fetchedEvent?.budgetItems || [];
        console.log('📦 EventDetailsModal - Budget Items Updated:', {
          eventId: fetchedEvent.id,
          budgetItemsCount: budgetItems.length,
          budgetItems: budgetItems,
        });
        setEventBudgetItems(budgetItems);

        // Update strategicGoals - always update when available (same pattern as transactions)
        // Always update, even if empty array, to ensure we have the latest data
        const strategicGoals = fetchedEvent?.strategicGoals || [];
        console.log('🎯 EventDetailsModal - Strategic Goals Updated:', {
          eventId: fetchedEvent.id,
          goalsCount: strategicGoals.length,
          goals: strategicGoals,
        });
        setEventStrategicGoals(strategicGoals);

        // Update files - always update when available (same pattern as transactions)
        // Always update, even if empty array, to ensure we have the latest data
        console.log('📁 EventDetailsModal - Processing Files:', {
          eventId: fetchedEvent.id,
          filesInEvent: fetchedEvent?.files,
          filesType: typeof fetchedEvent?.files,
          filesIsArray: Array.isArray(fetchedEvent?.files),
          filesValue: fetchedEvent?.files,
        });
        const files = fetchedEvent?.files || [];
        console.log('📁 EventDetailsModal - Files Updated:', {
          eventId: fetchedEvent.id,
          filesCount: files.length,
          files: files,
          currentEventFiles: eventFiles.length,
        });
        setEventFiles(files);

        // Update notes - always update when available (same pattern as transactions)
        // Always update, even if empty array, to ensure we have the latest data
        const notes = fetchedEvent?.notes || [];
        console.log('📝 EventDetailsModal - Notes Updated:', {
          eventId: fetchedEvent.id,
          notesCount: notes.length,
          notes: notes,
        });
        setEventNotes(notes);
        if (loadingEvent) {
          setLoadingEvent(false);
        }
        // Reset refreshing flag when we get data
        isRefreshingRef.current = false;
      } else if (loadingEvent) {
        setLoadingEvent(false);
        // Only set fullEvent from event prop if it has budgetItems, otherwise keep current fullEvent
        if (event?.budgetItems && event.budgetItems.length > 0) {
          setFullEvent(event);
        }
      }
    } else if (fetcher.state === 'idle' && loadingEvent) {
      // No data but fetcher is idle - stop loading
      setLoadingEvent(false);
      // Only set fullEvent from event prop if it has budgetItems, otherwise keep current fullEvent
      if (event?.budgetItems && event.budgetItems.length > 0) {
        setFullEvent(event);
      }
    }
  }, [fetcher.data, fetcher.state, loadingEvent, event?.id]);

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'budget', label: 'Budget Planner', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'strategic-goals', label: 'Strategic Goals', icon: Target },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'notes', label: 'Notes', icon: Edit },
  ];

  const handleStatusChange = async (newStatus: string) => {
    // Keep status lowercase for internal state
    const lowercaseStatus = newStatus.toLowerCase();
    setStatus(lowercaseStatus);
    
    // Capitalize the first letter to match backend expectations (Planning, Active, Completed, Cancelled)
    const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
    const statusValue = capitalizedStatus as EventStatus;
    
    if (isDemo) {
      await onUpdate({ status: statusValue });
      setFullEvent({ ...currentEvent, status: statusValue });
    } else {
      const formData = new FormData();
      formData.append('intent', 'updateStatus');
      formData.append('eventId', currentEvent.id);
      formData.append('status', capitalizedStatus); // Send capitalized status to backend
      fetcher.submit(formData, { method: 'post', action: '/events' });
      await onUpdate({ status: statusValue });
      setFullEvent({ ...currentEvent, status: statusValue });
    }
  };

  // Use fullEvent if available, otherwise use event
  // Prefer fullEvent (from fetcher) as it has the most complete data including budgetItems and expenses
  // Only use event prop if fullEvent doesn't exist or event has more recent data
  const currentEvent = (() => {
    if (!fullEvent) return event;
    if (!event) return fullEvent;
    
    // Prefer fullEvent if it has budgetItems or strategicGoals (loaded from fetcher)
    if ((fullEvent.budgetItems?.length || 0) > 0 || (fullEvent.strategicGoals?.length || 0) > 0) {
      return fullEvent;
    }
    
    // If event prop has more budgetItems or strategicGoals, use it (it's more recent)
    const eventHasMoreData = 
      (event.budgetItems?.length || 0) > (fullEvent.budgetItems?.length || 0) ||
      (event.strategicGoals?.length || 0) > (fullEvent.strategicGoals?.length || 0);
    
    return eventHasMoreData ? event : fullEvent;
  })();
  const budgetUtilization = currentEvent.budget && currentEvent.budget > 0 ? ((currentEvent.spent || 0) / currentEvent.budget) * 100 : 0;
  const remaining = (currentEvent.budget || 0) - (currentEvent.spent || 0);

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-gray-100 text-gray-700 border-gray-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.planning;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Mobile Overlay - Outside sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[45] sm:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl max-w-7xl w-full h-full sm:h-auto sm:max-h-[95vh] flex flex-col sm:flex-row overflow-hidden relative">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="sm:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          <FileText size={20} className="text-gray-700" />
        </button>

        {/* Sidebar Navigation - Matches Main Sidebar Colors */}
        <div className={`
          w-full sm:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col
          fixed sm:relative inset-y-0 left-0 z-[50] shadow-2xl sm:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        `}>

          {/* Sidebar Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-2">{currentEvent.name}</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 sm:hidden"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(currentEvent.status || 'planning')}`}>
              <Clock size={14} />
              <span className="capitalize">{currentEvent.status || 'planning'}</span>
            </div>
          </div>

          {/* Navigation Menu - Matches Main Sidebar Style */}
          <nav className="flex-1 overflow-y-auto p-4 bg-white">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    console.log('🔍 Clicked section:', section.id);
                    setActiveSection(section.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
                    transition-colors duration-200 text-left
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 bg-white'
                    }
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t border-gray-200 space-y-3 bg-gray-50 flex-shrink-0">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Total Budget</p>
              <p className="text-lg font-bold text-gray-900">${(currentEvent.budget || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Spent</p>
              <p className="text-lg font-bold text-gray-900">${(currentEvent.spent || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText size={20} className="text-gray-600" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{event.name}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 capitalize">{event.type || 'Event'} Event</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
              {user?.role !== 'Viewer' && (
                <div className="min-w-[120px]">
                  <Dropdown
                    value={status?.toLowerCase() || 'planning'}
                    onChange={handleStatusChange}
                    options={[
                      { value: 'planning', label: 'Planning' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    placeholder="Select status"
                    size="sm"
                    className="text-xs sm:text-sm"
                  />
                </div>
              )}
              {user?.role === 'Viewer' && (
                <span className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium bg-gray-50 text-gray-600 capitalize">
                  {event.status || 'planning'}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase">Budget</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${(currentEvent.budget || 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase">Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${(currentEvent.spent || 0).toLocaleString()}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Utilization</span>
                        <span className="font-semibold">{budgetUtilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            budgetUtilization > 90 ? 'bg-red-500' : 
                            budgetUtilization > 75 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Users size={20} className="text-indigo-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase">Attendees</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{(currentEvent.attendees || 0).toLocaleString()}</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <DollarSign size={20} className="text-emerald-600" />
                      </div>
                      <span className="text-xs text-gray-500 font-medium uppercase">Remaining</span>
                    </div>
                    <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Event Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-blue-600" />
                      Event Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                        <p className="text-gray-900 font-medium">
                          {(currentEvent.date || currentEvent.startDate) ? new Date(currentEvent.date || currentEvent.startDate!).toLocaleDateString() : 'TBD'}
                          {currentEvent.endDate && ` - ${new Date(currentEvent.endDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                        <div className="flex items-start gap-2">
                          <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 font-medium">{currentEvent.location || 'TBD'}</p>
                            {currentEvent.venue && (
                              <p className="text-sm text-gray-600 mt-1">{currentEvent.venue}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {currentEvent.organizer && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organizer</p>
                          <p className="text-gray-900 font-medium">{currentEvent.organizer}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-emerald-600" />
                      Budget Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Budget</span>
                        <span className="text-lg font-bold text-gray-900">${(currentEvent.budget || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="text-lg font-bold text-gray-900">${(currentEvent.spent || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Remaining</span>
                        <span className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            budgetUtilization > 90 ? 'bg-red-100 text-red-700' : 
                            budgetUtilization > 75 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {budgetUtilization.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              budgetUtilization > 90 ? 'bg-red-500' : 
                              budgetUtilization > 75 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText size={20} className="text-slate-600" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'budget' && (
              (() => {
                console.log('📊 Budget Section - Displaying Budget Items:', {
                  eventId: currentEvent.id,
                  eventName: currentEvent.name,
                  budgetItemsCount: eventBudgetItems.length,
                  budgetItems: eventBudgetItems,
                  strategicGoalsCount: eventStrategicGoals.length,
                  strategicGoals: eventStrategicGoals,
                  vendorsCount: eventVendors.length,
                  usersCount: eventUsers.length,
                });
                return (
                  <BudgetManager
                    user={user ?? null}
                    organization={organization}
                    event={currentEvent}
                    events={[currentEvent].filter(Boolean)}
                    budgetItems={eventBudgetItems}
                    users={eventUsers}
                    strategicGoals={eventStrategicGoals}
                    vendors={eventVendors}
                    isDemo={isDemo}
                    actionData={actionData}
                  />
                );
              })()
            )}

            {activeSection === 'transactions' && (
              (() => {
                console.log('💰 Transactions Section - Displaying Expenses:', {
                  eventId: currentEvent.id,
                  eventName: currentEvent.name,
                  expensesCount: eventExpenses.length,
                  expenses: eventExpenses,
                  vendorsCount: vendors.length,
                  vendors: vendors,
                });
                return (
                  <ExpenseTracker
                    user={user ?? null}
                    organization={organization}
                    event={currentEvent}
                    expenses={eventExpenses}
                    vendors={vendors}
                    isDemo={isDemo}
                    fetcher={fetcher}
                  />
                );
              })()
            )}

            {activeSection === 'strategic-goals' && (
              (() => {
                console.log('🔍 Strategic Goals State:', eventStrategicGoals);
                const goals = eventStrategicGoals.map(goal => {
                  // Handle deadline - it might be a Date object or a string
                  let deadlineStr: string | undefined = undefined;
                  if (goal.deadline) {
                    if (goal.deadline instanceof Date) {
                      deadlineStr = goal.deadline.toISOString();
                    } else if (typeof goal.deadline === 'string') {
                      deadlineStr = goal.deadline;
                    } else {
                      // Try to parse as date string
                      const date = new Date(goal.deadline);
                      if (!isNaN(date.getTime())) {
                        deadlineStr = date.toISOString();
                      }
                    }
                  }
                  
                  return {
                    id: goal.id,
                    title: goal.title,
                    description: goal.description || '',
                    targetValue: goal.targetValue ?? undefined,
                    currentValue: goal.currentValue ?? undefined,
                    unit: goal.unit ?? undefined,
                    deadline: deadlineStr,
                    status: goal.status as 'not-started' | 'in-progress' | 'completed',
                    priority: goal.priority as 'low' | 'medium' | 'high',
                  };
                });
                console.log('🎯 Strategic Goals Section - Displaying Goals:', {
                  eventId: currentEvent.id,
                  eventName: currentEvent.name,
                  goalsCount: goals.length,
                  goals: goals,
                  rawStrategicGoals: eventStrategicGoals,
                });
                return (
                  <StrategicGoals
                    eventId={currentEvent.id}
                    parentFetcher={fetcher}
                    goals={goals}
                    isDemo={isDemo}
                    user={user ?? null}
                  />
                );
              })()
            )}

            {activeSection === 'documents' && (
              (() => {
                console.log('📁 Documents Section - Displaying Files:', {
                  eventId: currentEvent.id,
                  eventName: currentEvent.name,
                  filesCount: eventFiles.length,
                  files: eventFiles,
                  currentEventFiles: currentEvent?.files?.length || 0,
                });
                return (
                  <EventDocuments
                    eventId={currentEvent.id}
                    documents={eventFiles}
                    isDemo={isDemo}
                    user={user ?? null}
                    fetcher={fetcher}
                    onUpload={async (file) => {
                      if (!isDemo) {
                        // File upload is handled by EventDocuments component via fetcher submission
                        console.log('File upload initiated:', file.name);
                      }
                    }}
                    onDelete={async (documentId) => {
                      if (!isDemo) {
                        // File deletion is handled by EventDocuments component via fetcher submission
                        console.log('File deletion initiated:', documentId);
                      }
                    }}
                  />
                );
              })()
            )}

            {activeSection === 'notes' && (
              <EventNotes
                eventId={currentEvent.id}
                notes={eventNotes}
                isDemo={isDemo}
                user={user ?? null}
                fetcher={fetcher}
                onSave={async (notes) => {
                  // In demo mode, update local state to keep notes in sync
                  // In non-demo mode, EventNotes uses fetcher submissions which are handled
                  // by the route handler and trigger a reload via fetcher
                  if (isDemo) {
                    setEventNotes(notes);
                    // Also update fullEvent to keep it consistent
                    setFullEvent({ ...currentEvent, notes });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

