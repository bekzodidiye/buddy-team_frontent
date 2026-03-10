
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import Features from './components/Features';
import Team from './components/Team';
import Contact from './components/Contact';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { INITIAL_PROGRESS_DATA, TEAM_MEMBERS, INITIAL_HIGHLIGHTS_DATA } from './constants';
import { StudentProgress, WeeklyHighlight, TeamMember, Season, Notification, Page, UserData } from './types';

const BuddyStorage = {
  KEYS: {
    CURRENT_PAGE: 'buddy_current_page',
    USER: 'buddy_user',
    ALL_USERS: 'buddy_all_users',
    STUDENTS_DATA: 'buddy_all_students_data',
    HIGHLIGHTS: 'buddy_weekly_highlights',
    REGISTRATION_OPEN: 'buddy_is_registration_open',
    CURATOR_REGISTRATION_OPEN: 'buddy_is_curator_registration_open',
    NOTIFICATIONS: 'buddy_notifications',
    SEASONS: 'buddy_seasons',
    ACTIVE_SEASON_ID: 'buddy_active_season_id',
    CHAT_MESSAGES: 'buddy_chat_messages'
  },
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage`, e);
    }
  },
  load: <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage`, e);
      return defaultValue;
    }
  }
};

const App: React.FC = () => {
  console.log('App is rendering');
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    try {
      return (localStorage.getItem(BuddyStorage.KEYS.CURRENT_PAGE) as Page) || 'home';
    } catch (e) {
      return 'home';
    }
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<UserData | null>(() => BuddyStorage.load(BuddyStorage.KEYS.USER, null));
  const [allStudentsData, setAllStudentsData] = useState<StudentProgress[]>(() => BuddyStorage.load(BuddyStorage.KEYS.STUDENTS_DATA, INITIAL_PROGRESS_DATA));
  const [weeklyHighlights, setWeeklyHighlights] = useState<WeeklyHighlight[]>(() => BuddyStorage.load(BuddyStorage.KEYS.HIGHLIGHTS, INITIAL_HIGHLIGHTS_DATA));
  const [dynamicTeamMembers, setDynamicTeamMembers] = useState<TeamMember[]>([]);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(() => BuddyStorage.load(BuddyStorage.KEYS.REGISTRATION_OPEN, true));
  const [isCuratorRegistrationOpen, setIsCuratorRegistrationOpen] = useState(() => BuddyStorage.load(BuddyStorage.KEYS.CURATOR_REGISTRATION_OPEN, true));
  
  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>(() => BuddyStorage.load(BuddyStorage.KEYS.NOTIFICATIONS, [
    {
      id: 'n1',
      title: 'Xush kelibsiz!',
      message: 'Buddy Team portalining yangi talqiniga xush kelibsiz. Monitoring bo\'limini tekshirishni unutmang.',
      type: 'info',
      timestamp: new Date().toISOString(),
      isRead: false,
      targetRole: 'all',
      sender: 'Sistema'
    }
  ]));

  const filteredNotifications = useMemo(() => {
    if (!user) return [];
    const userCreatedAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
    
    return notifications.filter(notif => {
      // Faqat ro'yxatdan o'tgandan keyingi xabarlarni ko'rsatish
      const notifTime = new Date(notif.timestamp).getTime();
      if (notifTime < userCreatedAt) return false;

      // If specific user ID is targeted, only show to that user
      if (notif.targetUserId) {
        return notif.targetUserId === user.id;
      }
      // Otherwise filter by role
      return notif.targetRole === 'all' || notif.targetRole === user.role;
    });
  }, [notifications, user]);

  const [seasons, setSeasons] = useState<Season[]>(() => BuddyStorage.load(BuddyStorage.KEYS.SEASONS, [
    { id: '1', number: 1, startDate: '2025-05-01', isActive: true }
  ]));
  const [activeSeasonId, setActiveSeasonId] = useState(() => {
    try {
      return localStorage.getItem(BuddyStorage.KEYS.ACTIVE_SEASON_ID) || '1';
    } catch (e) {
      return '1';
    }
  });

  const [allUsers, setAllUsers] = useState<UserData[]>(() => {
    const saved = BuddyStorage.load<UserData[] | null>(BuddyStorage.KEYS.ALL_USERS, null);
    if (saved) return saved;

    const initialUsers: UserData[] = [];
    
    TEAM_MEMBERS.forEach(m => {
      initialUsers.push({
        id: m.id,
        name: m.name,
        username: m.name.toLowerCase(),
        email: `${m.name.toLowerCase()}@buddy.uz`,
        role: 'curator',
        status: 'active',
        avatar: m.avatar,
        field: m.role,
        skills: m.skills,
        longBio: m.longBio,
        fieldDescription: m.fieldDescription,
        motivationQuote: m.motivationQuote,
        isApproved: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      });
    });

    const uniqueStudentNames = Array.from(new Set(INITIAL_PROGRESS_DATA.map(p => p.studentName)));
    uniqueStudentNames.forEach((name, idx) => {
      const studentProgress = INITIAL_PROGRESS_DATA.find(p => p.studentName === name);
      initialUsers.push({
        id: `init-student-${idx}`,
        name: name,
        username: name.toLowerCase().replace(/\s/g, '_'),
        email: `${name.toLowerCase().replace(/\s/g, '_')}@buddy.uz`,
        role: 'student',
        status: 'active',
        assignedCuratorId: studentProgress?.curatorId || null,
        isApproved: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      });
    });

    return initialUsers;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(BuddyStorage.KEYS.CURRENT_PAGE, currentPage);
  }, [currentPage]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.USER, user);
  }, [user]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.STUDENTS_DATA, allStudentsData);
  }, [allStudentsData]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.HIGHLIGHTS, weeklyHighlights);
  }, [weeklyHighlights]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.REGISTRATION_OPEN, isRegistrationOpen);
  }, [isRegistrationOpen]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.CURATOR_REGISTRATION_OPEN, isCuratorRegistrationOpen);
  }, [isCuratorRegistrationOpen]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.SEASONS, seasons);
  }, [seasons]);

  useEffect(() => {
    localStorage.setItem(BuddyStorage.KEYS.ACTIVE_SEASON_ID, activeSeasonId);
  }, [activeSeasonId]);

  useEffect(() => {
    BuddyStorage.save(BuddyStorage.KEYS.ALL_USERS, allUsers);
  }, [allUsers]);

  useEffect(() => {
    // Faqat statusi 'active' bo'lgan kuratorlarni chiqarish
    const approvedCurators = allUsers
      .filter(u => u.role === 'curator' && u.status === 'active')
      .map(u => ({
        id: u.id,
        name: u.name,
        role: u.field || 'Mentor',
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop',
        bio: u.longBio?.slice(0, 100) || "Buddy jamoasining faol kuratori.",
        longBio: u.longBio || "Foydalanuvchi haqida ma'lumot yo'q.",
        fieldDescription: u.fieldDescription || "O'quvchilarga o'z yo'nalishi bo'yicha yordam beradi.",
        motivationQuote: u.motivationQuote || "Harakatda barakat!",
        skills: u.skills || [],
        socialLinks: u.socialLinks || []
      }));
    setDynamicTeamMembers(approvedCurators);
  }, [allUsers]);

  const handleNavigateToAuth = (mode: 'login' | 'signup') => {
    if (mode === 'signup' && !isRegistrationOpen) {
      setAuthMode('login');
    } else {
      setAuthMode(mode);
    }
    setCurrentPage('auth');
  };

  const handleLoginSuccess = (userData: UserData) => {
    let finalUserData = { ...userData };
    if (userData.username.toLowerCase() === 'admin') {
      finalUserData.role = 'admin';
      finalUserData.status = 'active';
      finalUserData.isApproved = true;
    }
    const existingUser = allUsers.find(u => u.username === finalUserData.username);
    if (existingUser) {
      setUser(existingUser);
      setCurrentPage(existingUser.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      setAllUsers(prev => [...prev, finalUserData]);
      setUser(finalUserData);
      setCurrentPage(finalUserData.role === 'admin' ? 'admin' : 'dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleUpdateStudent = (updatedStudent: StudentProgress) => {
    setAllStudentsData(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleApproveUser = (userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true, status: 'active' } : u));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, isApproved: true, status: 'active' } : null);
    }
  };

  const handleChangeUserStatus = (userId: string, status: 'active' | 'inactive' | 'pending') => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleUpdateProfile = (data: Partial<UserData>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...data } : u));
  };

  const handleUpdateSeason = (seasonId: string, updates: Partial<Season>) => {
    setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, ...updates } : s));
  };

  const handleDeleteSeason = (seasonId: string) => {
    setSeasons(prev => {
      const newSeasons = prev.filter(s => s.id !== seasonId);
      if (activeSeasonId === seasonId && newSeasons.length > 0) {
        setActiveSeasonId(newSeasons[newSeasons.length - 1].id);
      }
      return newSeasons;
    });
  };

  const handleStartNewSeason = (durationInMonths: number = 3) => {
    const nextNumber = seasons.length + 1;
    const nextSeason: Season = {
      id: nextNumber.toString(),
      number: nextNumber,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      durationInMonths
    };
    setSeasons(prev => prev.map(s => ({...s, isActive: false })).concat([nextSeason]));
    setActiveSeasonId(nextSeason.id);
    setIsRegistrationOpen(true);
    
    handleAddNotification({
      id: Math.random().toString(36).substr(2, 9),
      title: `Yangi Mavsum #${nextNumber} boshlandi!`,
      message: 'Buddy Team loyihasida yangi mavsum start oldi. Rejalaringizni belgilashni boshlang.',
      type: 'success',
      timestamp: new Date().toISOString(),
      isRead: false,
      targetRole: 'all',
      sender: 'Admin'
    });
  };

  const handleAddNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleAssignStudent = (studentId: string) => {
    if (!user) return;
    setAllUsers(prev => prev.map(u => u.id === studentId ? { ...u, assignedCuratorId: user.id } : u));
    
    const student = allUsers.find(u => u.id === studentId);
    if (student) {
        handleAddNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: 'Yangi Kurator Biriktirildi',
            message: `${user.name} sizni o'z jamoasiga qo'shdi.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            isRead: false,
            targetRole: 'student',
            targetUserId: studentId,
            sender: user.name
        });
    }
  };

  const handleUnassignStudent = (studentId: string) => {
    setAllUsers(prev => prev.map(u => u.id === studentId ? { ...u, assignedCuratorId: null } : u));
  };

  const handleAssignCurator = (curatorId: string) => {
    if (!user) return;
    
    // Update local user state
    setUser(prev => prev ? { ...prev, assignedCuratorId: curatorId } : null);
    
    // Update allUsers state
    setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, assignedCuratorId: curatorId } : u));

    // Notify the curator
    const curator = allUsers.find(u => u.id === curatorId);
    if (curator) {
        handleAddNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: 'Yangi O\'quvchi Qo\'shildi',
            message: `${user.name} sizni o'z kuratori sifatida tanladi.`,
            type: 'success',
            timestamp: new Date().toISOString(),
            isRead: false,
            targetRole: 'curator',
            targetUserId: curatorId,
            sender: user.name
        });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0c]">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onAuthNavigate={handleNavigateToAuth} 
        user={user}
        onLogout={handleLogout}
        isRegistrationOpen={isRegistrationOpen}
        unreadCount={filteredNotifications.filter(n => !n.isRead).length}
      />
      <main className="animate-in fade-in duration-700">
        {currentPage === 'home' && <HomeView onNavigate={setCurrentPage} onAuthNavigate={handleNavigateToAuth} isRegistrationOpen={isRegistrationOpen} />}
        {currentPage === 'features' && <div className="pt-20"><Features /></div>}
        {currentPage === 'team' && (
          <div className="pt-20">
            <Team 
              user={user} 
              onAssignCurator={handleAssignCurator} 
              customMembers={dynamicTeamMembers} 
              studentsData={allStudentsData} 
              highlights={weeklyHighlights}
              seasons={seasons}
              activeSeasonId={activeSeasonId}
            />
          </div>
        )}
        {currentPage === 'dashboard' && (
          <div className="pt-20">
            <Dashboard 
              user={user} studentsData={allStudentsData} highlights={weeklyHighlights} 
              allUsers={allUsers}
              onRemoveStudent={(id) => setAllStudentsData(prev => prev.filter(s => s.id !== id))}
              onUpdateProfile={handleUpdateProfile}
              onUpdateStudent={handleUpdateStudent}
              onAddProgress={(p) => setAllStudentsData(prev => [...prev, {...p, seasonId: activeSeasonId}])}
              onAddHighlight={(h) => setWeeklyHighlights(prev => [...prev, {...h, seasonId: activeSeasonId}])}
              onRemoveHighlight={(id) => setWeeklyHighlights(prev => prev.filter(h => h.id !== id))}
              activeSeasonId={activeSeasonId}
              seasons={seasons}
              notifications={filteredNotifications}
              onMarkRead={handleMarkNotificationAsRead}
              onAssignStudent={handleAssignStudent}
              onUnassignStudent={handleUnassignStudent}
            />
          </div>
        )}
        {currentPage === 'admin' && (
          <div className="pt-20">
            <AdminPanel 
              user={user} allUsers={allUsers} allProgress={allStudentsData} 
              onDeleteUser={(id) => setAllUsers(prev => prev.filter(u => u.id !== id))}
              onChangeRole={(id, role) => setAllUsers(prev => prev.map(u => u.id === id ? {...u, role} : u))}
              onUpdateProgress={handleUpdateStudent}
              onApproveUser={handleApproveUser}
              onChangeStatus={handleChangeUserStatus}
              isRegistrationOpen={isRegistrationOpen}
              onToggleRegistration={() => setIsRegistrationOpen(!isRegistrationOpen)}
              isCuratorRegistrationOpen={isCuratorRegistrationOpen}
              onToggleCuratorRegistration={() => setIsCuratorRegistrationOpen(!isCuratorRegistrationOpen)}
              seasons={seasons}
              activeSeasonId={activeSeasonId}
              onSwitchSeason={setActiveSeasonId}
              onStartNewSeason={handleStartNewSeason}
              onUpdateSeason={handleUpdateSeason}
              onDeleteSeason={handleDeleteSeason}
              onSendNotification={handleAddNotification}
            />
          </div>
        )}
        {currentPage === 'auth' && (
          <AuthPage 
            initialMode={authMode} 
            onBack={() => setCurrentPage('home')} 
            onSuccess={handleLoginSuccess} 
            isRegistrationOpen={isRegistrationOpen} 
            isCuratorRegistrationOpen={isCuratorRegistrationOpen}
          />
        )}
        {currentPage === 'contact' && <div className="pt-20"><Contact /></div>}
      </main>
      <Footer onNavigate={setCurrentPage} />
      <ChatBot />
    </div>
  );
};

export default App;
