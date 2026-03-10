
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldAlert, Activity, Search, Trash2,
  ChevronLeft, ChevronRight, Briefcase, Eye, X, Menu,
  Shield, AlertTriangle, Lightbulb, CheckCircle2, XCircle,
  FileSpreadsheet, FileText, UserCircle, Rocket, History, Power, 
  ShieldCheck, Clock, Award, Filter, ListFilter, UserCheck, UserX,
  Mail, AtSign, Sparkles, Code, Bell, Check, Save, Target, 
  ExternalLink, Fingerprint, CalendarDays, Zap, Quote, Link2, Send, Info, ChevronDown, Loader2, TrendingUp, TrendingDown, Calendar, Edit2, Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import { UserData, StudentProgress, Season, Notification } from '../types';
import CustomDropdown from './CustomDropdown';

interface AdminPanelProps {
  user: UserData | null;
  allUsers: UserData[];
  allProgress: StudentProgress[];
  onDeleteUser: (userId: string) => void;
  onChangeRole: (userId: string, newRole: 'student' | 'curator' | 'admin') => void;
  onUpdateProgress: (progress: StudentProgress) => void;
  onApproveUser: (userId: string) => void;
  onChangeStatus?: (userId: string, status: 'active' | 'inactive' | 'pending') => void;
  isRegistrationOpen: boolean;
  onToggleRegistration: () => void;
  isCuratorRegistrationOpen: boolean;
  onToggleCuratorRegistration: () => void;
  seasons: Season[];
  activeSeasonId: string;
  onSwitchSeason: (id: string) => void;
  onStartNewSeason: () => void;
  onUpdateSeason: (id: string, updates: Partial<Season>) => void;
  onDeleteSeason: (id: string) => void;
  onSendNotification: (notif: Notification) => void;
}

const ITEMS_PER_PAGE = 15;

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  user, allUsers, allProgress, onDeleteUser, onChangeRole, onApproveUser, onChangeStatus,
  isRegistrationOpen, onToggleRegistration, isCuratorRegistrationOpen, onToggleCuratorRegistration, seasons, activeSeasonId, onSwitchSeason, onStartNewSeason, onUpdateSeason, onDeleteSeason, onSendNotification, onUpdateProgress
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'monitoring' | 'users' | 'requests' | 'seasons' | 'messages' | 'settings'>(() => (localStorage.getItem('buddy_admin_tab') as any) || 'monitoring');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [monitoringWeek, setMonitoringWeek] = useState(() => Number(localStorage.getItem('buddy_admin_monitoring_week')) || 1);
  const [monitoringSeasonId, setMonitoringSeasonId] = useState(activeSeasonId);

  const tabLabels = {
    stats: 'ANALITIKA',
    monitoring: 'MONITORING',
    users: 'A\'ZOLAR',
    requests: 'SO\'ROV',
    seasons: 'MAVSUMLAR',
    messages: 'XABARLAR',
    settings: 'SOZLAMALAR'
  };

  // Edit Student Modal State
  const [editingProgress, setEditingProgress] = useState<StudentProgress | null>(null);
  const [editPlanForm, setEditPlanForm] = useState({
    meetingDay: '',
    attended: false,
    weeklyGoal: '',
    difficulty: '',
    solution: '',
    status: 'Kutilmoqda' as 'Bajarilmoqda' | 'Hal qilindi' | 'Kutilmoqda' | 'Bajarmadi'
  });

  useEffect(() => {
    setMonitoringSeasonId(activeSeasonId);
  }, [activeSeasonId]);

  useEffect(() => {
    const activeSeason = seasons.find(s => s.id === monitoringSeasonId);
    const maxWeeks = (activeSeason?.durationInMonths || 3) * 4;
    if (monitoringWeek > maxWeeks) {
      setMonitoringWeek(maxWeeks);
    }
  }, [monitoringSeasonId, seasons, monitoringWeek]);

  useEffect(() => {
    localStorage.setItem('buddy_admin_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('buddy_admin_monitoring_week', monitoringWeek.toString());
  }, [monitoringWeek]);
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [monitoringCuratorFilter, setMonitoringCuratorFilter] = useState('all');
  const [monitoringStatusFilter, setMonitoringStatusFilter] = useState('all');
  const [monitoringAttendanceFilter, setMonitoringAttendanceFilter] = useState<'all' | 'attended' | 'not-attended'>('all');
  const [monitoringPage, setMonitoringPage] = useState(1);
  
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [usersFilterRole, setUsersFilterRole] = useState<'all' | 'student' | 'curator' | 'admin'>('all');
  const [usersPage, setUsersPage] = useState(1);

  const [selectedUserForView, setSelectedUserForView] = useState<UserData | null>(null);
  const [isDirectMessaging, setIsDirectMessaging] = useState(false);
  const [directMessageForm, setDirectMessageForm] = useState({ title: '', message: '', type: 'info' as Notification['type'] });

  const [messageForm, setMessageForm] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetRole: 'all' as Notification['targetRole']
  });
  const [isSending, setIsSending] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<string | null>(null);

  const handleEditStudent = (progress: StudentProgress) => {
    setEditingProgress(progress);
    setEditPlanForm({
      meetingDay: progress.meetingDay || '',
      attended: progress.attended || false,
      weeklyGoal: progress.weeklyGoal || '',
      difficulty: progress.difficulty || '',
      solution: progress.solution || '',
      status: progress.status || 'Kutilmoqda'
    });
  };

  const handleSaveEdit = () => {
    if (!editingProgress) return;
    onUpdateProgress({
      ...editingProgress,
      ...editPlanForm
    });
    setEditingProgress(null);
  };

  useEffect(() => {
    if (selectedUserForView) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setIsDirectMessaging(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [selectedUserForView]);

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('buddy_admin_notification_settings');
    return saved ? JSON.parse(saved) : {
      adminEmail: user?.email || '',
      onNewCuratorRequest: true,
      onGoalCompleted: true,
      onSeasonStart: true
    };
  });

  useEffect(() => {
    localStorage.setItem('buddy_admin_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => setUsersPage(1), [usersSearchQuery, usersFilterRole]);
  useEffect(() => setMonitoringPage(1), [monitoringSearch, monitoringCuratorFilter, monitoringStatusFilter, monitoringWeek, monitoringAttendanceFilter]);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0a0a0c]">
        <div className="text-center p-12 glass rounded-3xl border border-red-500/10 shadow-xl">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white mb-4">Kirish Taqiqlandi</h2>
          <p className="text-slate-400">Sizda ushbu sahifani ko'rish uchun ruxsat yo'q.</p>
        </div>
      </div>
    );
  }

  const curatorsList = useMemo(() => allUsers.filter(u => u.role === 'curator'), [allUsers]);
  const approvedCurators = useMemo(() => curatorsList.filter(u => u.status === 'active'), [curatorsList]);
  const pendingUsers = useMemo(() => allUsers.filter(u => u.status === 'pending'), [allUsers]);

  const stats = useMemo(() => {
    const totalCompleted = allProgress.filter(p => p.status === 'Hal qilindi').length;
    const overallRate = allProgress.length > 0 ? Math.round((totalCompleted / allProgress.length) * 100) : 0;
    return {
      curatorsCount: approvedCurators.length,
      pendingCount: pendingUsers.length,
      studentsCount: allUsers.filter(u => u.role === 'student').length,
      totalPlans: allProgress.length,
      overallRate
    };
  }, [approvedCurators, pendingUsers, allUsers, allProgress]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(usersSearchQuery.toLowerCase()) || 
                           u.username.toLowerCase().includes(usersSearchQuery.toLowerCase());
      const matchesRole = usersFilterRole === 'all' || u.role === usersFilterRole;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, usersSearchQuery, usersFilterRole]);

  const totalUsersPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, usersPage]);

  const seasonProgress = useMemo(() => {
    return allProgress.filter(p => p.seasonId === monitoringSeasonId);
  }, [allProgress, monitoringSeasonId]);

  const filteredMonitoring = useMemo(() => {
    return seasonProgress.filter(p => {
      const matchesWeek = p.weekNumber === monitoringWeek;
      const matchesSearch = p.studentName.toLowerCase().includes(monitoringSearch.toLowerCase());
      const matchesCurator = monitoringCuratorFilter === 'all' || p.curatorId === monitoringCuratorFilter;
      const matchesStatus = monitoringStatusFilter === 'all' || p.status === monitoringStatusFilter;
      const matchesAttendance = monitoringAttendanceFilter === 'all' || 
                               (monitoringAttendanceFilter === 'attended' ? p.attended === true : p.attended === false);
      return matchesWeek && matchesSearch && matchesCurator && matchesStatus && matchesAttendance;
    });
  }, [seasonProgress, monitoringWeek, monitoringSearch, monitoringCuratorFilter, monitoringStatusFilter, monitoringAttendanceFilter]);

  const curatorsWithProgress = useMemo(() => {
    const curatorIds = Array.from(new Set(filteredMonitoring.map(p => p.curatorId)));
    return curatorIds.map(id => {
      const curator = allUsers.find(u => u.id === id);
      const progress = filteredMonitoring.filter(p => p.curatorId === id);
      return { curator, progress };
    });
  }, [filteredMonitoring, allUsers]);

  const totalMonitoringPages = Math.ceil(curatorsWithProgress.length / 5);
  const paginatedCurators = useMemo(() => {
    const start = (monitoringPage - 1) * 5;
    return curatorsWithProgress.slice(start, start + 5);
  }, [curatorsWithProgress, monitoringPage]);

  // Jadval uchun Progress holati
  const getProgressStatusStyle = (status: string) => {
    switch(status) {
      case 'Hal qilindi': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Bajarmadi': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Bajarilmoqda': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Kutilmoqda': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  // Kuratorlar uchun foydalanuvchi statusi
  const getUserStatusStyle = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'inactive': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'curator': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const handleSaveNotificationSettings = async () => {
    setIsSavingSettings(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSavingSettings(false);
  };

  const handleSendMessage = async () => {
    if (!messageForm.title || !messageForm.message) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSendNotification({
      id: Math.random().toString(36).substr(2, 9),
      title: messageForm.title,
      message: messageForm.message,
      type: messageForm.type,
      targetRole: messageForm.targetRole,
      timestamp: new Date().toISOString(),
      isRead: false,
      sender: 'Admin'
    });
    setMessageForm({ title: '', message: '', type: 'info', targetRole: 'all' });
    setIsSending(false);
    alert('Xabar muvaffaqiyatli yuborildi!');
  };

  const handleSendDirectMessage = async () => {
    if (!selectedUserForView || !directMessageForm.title || !directMessageForm.message) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSendNotification({
      id: Math.random().toString(36).substr(2, 9),
      title: directMessageForm.title,
      message: directMessageForm.message,
      type: directMessageForm.type,
      targetRole: 'all',
      targetUserId: selectedUserForView.id,
      timestamp: new Date().toISOString(),
      isRead: false,
      sender: 'Admin'
    });
    setDirectMessageForm({ title: '', message: '', type: 'info' });
    setIsDirectMessaging(false);
    setIsSending(false);
    alert(`${selectedUserForView.name} uchun xabar yuborildi!`);
  };

  const getAssignedCurator = (student: UserData | null) => {
    if (!student || student.role !== 'student') return null;
    return allUsers.find(u => u.id === student.assignedCuratorId) || null;
  };

  const getAssignedStudents = (curator: UserData | null) => {
    if (!curator || curator.role !== 'curator') return [];
    return allUsers.filter(u => u.assignedCuratorId === curator.id);
  };

  return (
    <section className="py-10 md:py-20 bg-[#0a0a0c] min-h-screen">
      <div className="max-w-[1700px] mx-auto px-4 lg:px-10">
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16 relative">
          <div className="flex items-center justify-between w-full xl:w-auto">

            <div className="text-center xl:text-left">
              <div className="flex items-center justify-center xl:justify-start gap-2 text-indigo-500 font-black tracking-[0.5em] uppercase text-[10px] mb-4">
                <Shield className="w-4 h-4" /> Buddy Team
              </div>
              <h2 className="text-indigo-500 font-black tracking-[0.5em] uppercase text-[10px] mb-4 flex items-center justify-center xl:justify-start gap-3"><Shield className="w-4 h-4" /> Global Platform Admin</h2>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">Buddy<span className="text-slate-800">Panel</span></h1>
            </div>
            
            {/* Mobile/Tablet Menu Button */}
            {!isMobileNavOpen && (
              <button 
                  onClick={() => setIsMobileNavOpen(true)}
                  className="fixed -left-4 hover:left-0 top-1/2 -translate-y-1/2 z-[150] py-3 pr-2 pl-5 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-r-2xl text-white xl:hidden shadow-2xl transition-all duration-300"
              >
                  <ChevronRight className="w-5 h-5 opacity-70 hover:opacity-100" />
                  {stats.pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-[#0a0a0c]">{stats.pendingCount}</span>
                  )}
              </button>
            )}

          </div>
          
          <div className="w-full xl:w-auto">
            {/* Desktop Horizontal List */}
            <div className="hidden xl:flex overflow-x-auto no-scrollbar justify-start xl:justify-center p-1.5 bg-white/5 rounded-[10px] border border-white/5 backdrop-blur-3xl shadow-2xl relative w-full snap-x">
              {(['stats', 'monitoring', 'users', 'requests', 'seasons', 'messages', 'settings'] as const).map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`shrink-0 snap-start px-4 md:px-8 py-3 md:py-5 rounded-[10px] text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative ${
                    activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {tabLabels[tab]}
                  {tab === 'requests' && stats.pendingCount > 0 && (
                     <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-[#0a0a0c]">{stats.pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Side Panel */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)}
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 h-full w-[80vw] max-w-sm bg-[#0a0a0c] border-r border-white/10 p-6 shadow-2xl" onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-white font-black uppercase tracking-widest text-xs">Menyu</h3>
                  <button onClick={() => setIsMobileNavOpen(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="flex flex-col gap-4">
                  {(['stats', 'monitoring', 'users', 'requests', 'seasons', 'messages', 'settings'] as const).map(tab => (
                    <button 
                      key={tab} onClick={() => { setActiveTab(tab); setIsMobileNavOpen(false); }}
                      className={`px-6 py-4 rounded-[10px] text-[10px] font-black uppercase tracking-[0.2em] transition-all text-left ${
                        activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {tabLabels[tab]}
                    </button>
                  ))}
                </div>
                {/* Integrated button attached to the right side of the panel */}
                <button 
                  onClick={() => setIsMobileNavOpen(false)}
                  className="absolute top-1/2 -right-[49px] -translate-y-1/2 z-[10000] p-3 bg-[#0a0a0c] border border-white/10 border-l-0 rounded-r-xl text-white shadow-2xl"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'stats' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="glass rounded-[10px] border border-indigo-500/10 p-8 relative overflow-hidden group hover:border-indigo-500/40 transition-colors bg-[#11111a] shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-[10px] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                    <TrendingUp className="w-3 h-3" /> Faol
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{stats.studentsCount}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">O'quvchilar</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass rounded-[10px] border border-purple-500/10 p-8 relative overflow-hidden group hover:border-purple-500/40 transition-colors bg-[#15111a] shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-[10px] bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                    <Award className="w-3 h-3" /> Tasdiqlangan
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{stats.curatorsCount}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Kuratorlar</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="glass rounded-[10px] border border-green-500/10 p-8 relative overflow-hidden group hover:border-green-500/40 transition-colors bg-[#111a14] shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/20"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-[10px] bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-400">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <TrendingUp className="w-3 h-3" /> {stats.overallRate}% O'zlashtirish
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{stats.totalPlans}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Jami Rejalar</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="glass rounded-[10px] border border-orange-500/10 p-8 relative overflow-hidden group hover:border-orange-500/40 transition-colors bg-[#1a1511] shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/20"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-[10px] bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <AlertTriangle className="w-3 h-3" /> E'tibor talab
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{stats.pendingCount}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Kutilmoqda</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <div className="glass rounded-[10px] border border-white/5 p-8 shadow-xl">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 ml-2">Haftalik O'sish</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[1, 2, 3, 4].map(week => {
                      const weekData = allProgress.filter(p => p.weekNumber === week);
                      return {
                        name: `${week}-hafta`,
                        'Bajarildi': weekData.filter(p => p.status === 'Hal qilindi').length,
                        'Jami': weekData.length
                      };
                    })}>
                      <defs>
                        <linearGradient id="colorBajarildi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorJami" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#121214', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
                      />
                      <Area type="monotone" dataKey="Jami" stroke="#6366f1" fillOpacity={1} fill="url(#colorJami)" strokeWidth={3} activeDot={{ r: 6 }} />
                      <Area type="monotone" dataKey="Bajarildi" stroke="#10b981" fillOpacity={1} fill="url(#colorBajarildi)" strokeWidth={3} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution Chart */}
              <div className="glass rounded-[10px] border border-white/5 p-8 shadow-xl">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 ml-2">Holatlar Taqvimi</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Hal qilindi', count: allProgress.filter(p => p.status === 'Hal qilindi').length, color: '#10b981' },
                      { name: 'Bajarilmoqda', count: allProgress.filter(p => p.status === 'Bajarilmoqda').length, color: '#3b82f6' },
                      { name: 'Kutilmoqda', count: allProgress.filter(p => p.status === 'Kutilmoqda').length, color: '#f59e0b' },
                      { name: 'Bajarmadi', count: allProgress.filter(p => p.status === 'Bajarmadi').length, color: '#ef4444' },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#121214', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {
                          [
                            { name: 'Hal qilindi', count: allProgress.filter(p => p.status === 'Hal qilindi').length, color: '#10b981' },
                            { name: 'Bajarilmoqda', count: allProgress.filter(p => p.status === 'Bajarilmoqda').length, color: '#3b82f6' },
                            { name: 'Kutilmoqda', count: allProgress.filter(p => p.status === 'Kutilmoqda').length, color: '#f59e0b' },
                            { name: 'Bajarmadi', count: allProgress.filter(p => p.status === 'Bajarmadi').length, color: '#ef4444' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Attendance Pie Chart */}
              <div className="glass rounded-[10px] border border-white/5 p-8 shadow-xl">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 ml-2">Davomat Ko'rsatkichi</h4>
                <div className="h-[300px] w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Qatnashganlar', value: allProgress.filter(p => p.attended === true).length, color: '#10b981' },
                          { name: 'Qatnashmaganlar', value: allProgress.filter(p => p.attended === false).length, color: '#ef4444' },
                          { name: 'Belgilanmagan', value: allProgress.filter(p => p.attended === undefined).length, color: '#64748b' }
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {
                          [
                            { name: 'Qatnashganlar', value: allProgress.filter(p => p.attended === true).length, color: '#10b981' },
                            { name: 'Qatnashmaganlar', value: allProgress.filter(p => p.attended === false).length, color: '#ef4444' },
                            { name: 'Belgilanmagan', value: allProgress.filter(p => p.attended === undefined).length, color: '#64748b' }
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))
                        }
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#121214', border: '1px solid #ffffff10', borderRadius: '1rem' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}
                        labelStyle={{ display: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{allProgress.filter(p => p.attended === true).length}</span>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Qatnashgan</span>
                  </div>
                </div>
              </div>

              {/* Top Curators */}
              <div className="glass rounded-[10px] border border-white/5 p-8 shadow-xl">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 ml-2">Eng Faol Kuratorlar</h4>
                <div className="space-y-4">
                  {allUsers
                    .filter(u => u.role === 'curator')
                    .map(curator => {
                      const curatorProgress = allProgress.filter(p => p.curatorId === curator.id);
                      const completedCount = curatorProgress.filter(p => p.status === 'Hal qilindi').length;
                      const totalCount = curatorProgress.length;
                      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      return { curator, completedCount, totalCount, completionRate };
                    })
                    .sort((a, b) => b.completedCount - a.completedCount)
                    .slice(0, 4)
                    .map((item, index) => (
                      <div key={item.curator.id} className="flex flex-col p-4 rounded-[10px] bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[10px] bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-sm border border-indigo-500/20">
                              #{index + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-white">{item.curator.name}</h5>
                              <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest mt-0.5">{item.completedCount} ta hal qilingan</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-white">{item.completionRate}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${item.completionRate}%` }}></div>
                        </div>
                      </div>
                    ))
                  }
                  {allUsers.filter(u => u.role === 'curator').length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">Kuratorlar topilmadi</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="animate-in fade-in duration-500 space-y-12">
             <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-8">
                <div className="text-center xl:text-left">
                   <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4">
                     <Activity className="w-4 h-4 text-indigo-400" />
                     <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Global Monitoring</span>
                   </div>
                   <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">Hafta #0{monitoringWeek}</h1>
                   <p className="text-slate-400 max-w-2xl mx-auto xl:mx-0 text-lg leading-relaxed font-medium">
                     Mavsum #{seasons.find(s => s.id === monitoringSeasonId)?.number} - {filteredMonitoring.length} ta yozuv topildi
                   </p>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4 self-center w-full xl:w-auto">
                    {/* Week Selector */}
                    <div className="flex items-center bg-[#121214] border border-white/5 rounded-2xl p-1 h-[52px] shadow-xl w-full sm:w-auto justify-between sm:justify-center order-2 sm:order-1">
                        <button disabled={monitoringWeek === 1} onClick={() => setMonitoringWeek(w => w - 1)} className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-20 active:scale-90">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-6 flex flex-col items-center justify-center border-x border-white/5 h-2/3 min-w-[100px]">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-1">Haftalik</span>
                            <span className="text-xl font-black text-white leading-none">#{monitoringWeek.toString().padStart(2, '0')}</span>
                        </div>
                        <button disabled={monitoringWeek >= (seasons.find(s => s.id === monitoringSeasonId)?.durationInMonths || 3) * 4} onClick={() => setMonitoringWeek(w => w + 1)} className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-20 active:scale-90">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Season Selector */}
                    <div className="flex items-center w-full sm:w-auto order-1 sm:order-2">
                        <CustomDropdown
                            variant="compact"
                            className="w-full sm:w-[220px]"
                            options={seasons.map(s => ({
                                value: s.id,
                                label: `Mavsum #${s.number}`,
                                icon: <div className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-green-500 animate-pulse' : 'bg-indigo-500'}`} />
                            }))}
                            value={monitoringSeasonId}
                            onChange={setMonitoringSeasonId}
                            placeholder="Mavsum tanlang"
                        />
                    </div>
                 </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 bg-[#121214] p-6 md:p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors z-10" />
                    <input type="text" placeholder="O'quvchini qidirish..." className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-indigo-600 transition-all shadow-inner" value={monitoringSearch} onChange={e => setMonitoringSearch(e.target.value)} />
                </div>
                
                <CustomDropdown
                    options={[
                        { value: 'all', label: 'Barcha Kuratorlar' },
                        ...approvedCurators.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    value={monitoringCuratorFilter}
                    onChange={setMonitoringCuratorFilter}
                    icon={<Users className="w-5 h-5" />}
                    placeholder="Kuratorni tanlang"
                />

                <CustomDropdown
                    options={[
                        { value: 'all', label: 'Barcha Holatlar' },
                        { value: 'Hal qilindi', label: 'Hal qilindi' },
                        { value: 'Bajarilmoqda', label: 'Bajarilmoqda' },
                        { value: 'Kutilmoqda', label: 'Kutilmoqda' },
                        { value: 'Bajarmadi', label: 'Bajarmadi' }
                    ]}
                    value={monitoringStatusFilter}
                    onChange={setMonitoringStatusFilter}
                    icon={<Filter className="w-5 h-5" />}
                    placeholder="Holatni tanlang"
                />

                <CustomDropdown
                    options={[
                        { value: 'all', label: 'Barcha Davomat' },
                        { value: 'attended', label: 'Qatnashganlar' },
                        { value: 'not-attended', label: 'Qatnashmaganlar' }
                    ]}
                    value={monitoringAttendanceFilter}
                    onChange={(val) => setMonitoringAttendanceFilter(val as any)}
                    icon={monitoringAttendanceFilter === 'not-attended' ? <UserX className="w-5 h-5 text-red-500" /> : <UserCheck className="w-5 h-5" />}
                    placeholder="Davomatni tanlang"
                />

                <div className="flex items-center justify-end gap-3"><button onClick={() => { setMonitoringSearch(''); setMonitoringCuratorFilter('all'); setMonitoringStatusFilter('all'); setMonitoringAttendanceFilter('all'); }} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">Tozalash</button></div>
             </div>
             <div className="space-y-12">
                {paginatedCurators.length > 0 ? paginatedCurators.map(({ curator, progress }, index) => (
                   <div key={curator?.id || `unknown-${index}`} className="space-y-6">
                      <div 
                         className="flex items-center justify-between px-8 py-6 bg-indigo-600/10 border border-indigo-500/10 rounded-[2.5rem] shadow-lg cursor-pointer hover:bg-indigo-600/20 transition-all"
                         onClick={() => curator && setSelectedUserForView(curator)}
                      >
                         <div className="flex items-center gap-6">
                            {curator?.avatar ? (
                               <img src={curator.avatar} alt={curator.name} className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-white/10" />
                            ) : (
                               <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-xl">
                                  {curator?.name[0] || '?'}
                               </div>
                            )}
                            <div>
                               <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{curator?.name || 'Noma\'lum Kurator'}</h3>
                               <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Mas'ul Kurator</p>
                            </div>
                         </div>
                         <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-3">O'quvchilar:</span>
                            <span className="text-lg font-black text-white">{progress.length}</span>
                         </div>
                      </div>

                       <div className="glass rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl bg-[#0a0a0c]/60 backdrop-blur-3xl">
                         <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse table-auto min-w-[1000px]">
                               <thead>
                                  <tr className="bg-white/[0.04] border-b border-white/5">
                                     <th className="w-[20%] px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">O'quvchi</th>
                                     <th className="w-[15%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Uchrashuv</th>
                                     <th className="w-[20%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Haftalik Maqsad</th>
                                     <th className="w-[15%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asosiy Muammo</th>
                                     <th className="w-[15%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Berilgan Yechim</th>
                                     <th className="w-[10%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Holat</th>
                                     <th className="w-[5%] px-6 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Amal</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {progress.map(item => {
                                     const student = allUsers.find(u => u.name === item.studentName);
                                     return (
                                        <tr key={item.id} className="hover:bg-indigo-600/[0.03] transition-all duration-300">
                                          <td className="px-10 py-8">
                                             <div className="flex items-center gap-4 cursor-pointer group/name" onClick={() => student && setSelectedUserForView(student)}>
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center text-sm text-indigo-400 font-black group-hover/name:bg-indigo-600 group-hover/name:text-white transition-all shadow-sm">{item.studentName[0]}</div>
                                                <div>
                                                   <p className="text-base font-black text-white tracking-tight group-hover/name:text-indigo-400 transition-colors">{item.studentName}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-8">
                                             <div className="flex flex-col gap-1.5">
                                                <p className="text-[11px] text-indigo-300 font-black uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {item.meetingDay ? new Date(item.meetingDay).toLocaleDateString() : 'Kiritilmagan'}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${item.attended ? 'text-green-500' : 'text-red-500'}`}>{item.attended ? 'Ishtirok etdi' : 'Ishtirok etmadi'}</p>
                                             </div>
                                          </td>
                                          <td className="px-6 py-8"><p className="text-[13px] text-slate-300 leading-relaxed font-medium">{item.weeklyGoal || 'Kiritilmagan'}</p></td>
                                          <td className="px-6 py-8">
                                             <p className={`text-[13px] leading-relaxed font-medium ${!item.difficulty || item.difficulty === 'Yo\'q' ? 'text-slate-500' : 'text-slate-300'}`}>{item.difficulty || 'Yo\'q'}</p>
                                          </td>
                                          <td className="px-6 py-8">
                                             <p className={`text-[13px] leading-relaxed font-medium ${!item.solution ? 'text-slate-500 italic' : 'text-slate-300'}`}>{item.solution || 'Kutilmoqda'}</p>
                                          </td>
                                          <td className="px-6 py-8"><span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm ${getProgressStatusStyle(item.status as any)}`}>{item.status}</span></td>
                                          <td className="px-6 py-8 text-center">
                                             <div className="flex items-center justify-center">
                                                <button onClick={() => handleEditStudent(item)} className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5"><Edit2 className="w-4 h-4" /></button>
                                             </div>
                                          </td>
                                        </tr>
                                     );
                                  })}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                )) : (
                   <div className="py-40 text-center glass rounded-[3.5rem] border-dashed border-2 border-white/5">
                      <Activity className="w-20 h-20 text-slate-800 mx-auto mb-8 opacity-20" />
                      <p className="text-2xl font-black text-slate-700 uppercase tracking-widest">Ma'lumotlar mavjud emas</p>
                   </div>
                )}
             </div>

             {/* Pagination for Monitoring */}
             {totalMonitoringPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10">
                   <button 
                      disabled={monitoringPage === 1} 
                      onClick={() => setMonitoringPage(p => p - 1)}
                      className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:text-white transition-all disabled:opacity-20"
                   >
                      <ChevronLeft className="w-6 h-6" />
                   </button>
                   <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-sm font-black text-white">{monitoringPage} / {totalMonitoringPages}</span>
                   </div>
                   <button 
                      disabled={monitoringPage === totalMonitoringPages} 
                      onClick={() => setMonitoringPage(p => p + 1)}
                      className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:text-white transition-all disabled:opacity-20"
                   >
                      <ChevronRight className="w-6 h-6" />
                   </button>
                </div>
             )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#121214] p-6 md:p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="flex-1 w-full max-w-2xl relative group"><Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-indigo-500 transition-colors" /><input type="text" placeholder="A'zoni qidirish..." className="w-full bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] py-6 pl-20 pr-8 text-white text-base outline-none focus:border-indigo-600 transition-all shadow-inner" value={usersSearchQuery} onChange={e => setUsersSearchQuery(e.target.value)} /></div>
                <div className="flex flex-wrap justify-center p-1.5 bg-[#0a0a0c] rounded-[2.5rem] border border-white/5 shadow-inner">{(['all', 'student', 'curator', 'admin'] as const).map(r => (<button key={r} onClick={() => setUsersFilterRole(r)} className={`px-8 py-3.5 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all ${usersFilterRole === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{r === 'all' ? 'Barchasi' : r}</button>))}</div>
             </div>
              <div className="glass rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl bg-[#0a0a0c]/50"><div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[1000px]"><thead><tr className="bg-white/[0.03] border-b border-white/5"><th className="px-12 py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Foydalanuvchi</th><th className="px-8 py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Status</th><th className="px-8 py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Lavozimi</th><th className="px-8 py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Soha</th><th className="px-12 py-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Boshqaruv</th></tr></thead><tbody className="divide-y divide-white/5">{paginatedUsers.length > 0 ? paginatedUsers.map(u => (<tr key={u.id} className="group hover:bg-indigo-600/[0.03] transition-all duration-300 cursor-pointer" onClick={() => setSelectedUserForView(u)}><td className="px-12 py-10"><div className="flex items-center gap-6"><div className="w-16 h-16 rounded-[1.8rem] bg-indigo-600/10 border border-white/5 flex items-center justify-center font-black text-indigo-400 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden relative shrink-0">{u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0]}</div><div><p className="text-xl font-black text-white leading-none mb-2">{u.name}</p><p className="text-[13px] text-slate-600 font-bold">@{u.username}</p></div></div></td><td className="px-8 py-10"><span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getUserStatusStyle(u.status)}`}>{u.status === 'active' ? 'Faol' : u.status === 'inactive' ? 'Passiv' : 'Kutilmoqda'}</span></td><td className="px-8 py-10"><span className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${getRoleStyle(u.role)}`}>{u.role}</span></td><td className="px-8 py-10"><div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-slate-600 shrink-0" /><span className="text-sm font-bold text-slate-500 tracking-tight">{u.field || 'Noma\'lum'}</span></div></td><td className="px-12 py-10 text-center"><div className="flex items-center justify-center gap-4"><div className="p-4 bg-white/5 text-slate-500 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg" title="Ko'rish"><Eye className="w-5 h-5" /></div><button onClick={(e) => { e.stopPropagation(); onDeleteUser(u.id); }} className="p-4 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all" title="O'chirish"><Trash2 className="w-5 h-5" /></button></div></td></tr>)) : (<tr><td colSpan={5} className="py-32 text-center text-slate-700 font-black uppercase tracking-widest text-xs">A'zolar topilmadi</td></tr>)}</tbody></table></div></div>
              {/* Pagination for Users */}
              {totalUsersPages > 1 && (
                 <div className="flex items-center justify-center gap-4 pt-10">
                    <button 
                       disabled={usersPage === 1} 
                       onClick={() => setUsersPage(p => p - 1)}
                       className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:text-white transition-all disabled:opacity-20"
                    >
                       <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-sm font-black text-white">{usersPage} / {totalUsersPages}</span>
                    </div>
                    <button 
                       disabled={usersPage === totalUsersPages} 
                       onClick={() => setUsersPage(p => p + 1)}
                       className="p-4 bg-white/5 text-slate-400 rounded-2xl border border-white/5 hover:text-white transition-all disabled:opacity-20"
                    >
                       <ChevronRight className="w-6 h-6" />
                    </button>
                 </div>
              )}
          </div>
        )}

        {activeTab === 'requests' && (
           <div className="space-y-10 animate-in fade-in duration-500">
              <div className="text-center mb-16"><h2 className="text-4xl font-black text-white tracking-tighter mb-4">Kuratorlik So'rovlari</h2><p className="text-slate-500 text-lg">Yangi ro'yxatdan o'tgan mentorlarni ko'rib chiqing, profillarini o'rganing va tasdiqlang.</p></div>
              {pendingUsers.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {pendingUsers.map(pc => (
                       <div key={pc.id} onClick={() => setSelectedUserForView(pc)} className="glass border border-white/5 rounded-[3rem] p-6 md:p-10 flex flex-col items-center text-center group hover:border-indigo-500/40 transition-all shadow-2xl cursor-pointer">
                          <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-600/10 border border-white/5 mb-8 flex items-center justify-center text-indigo-400 text-4xl font-black overflow-hidden shadow-xl group-hover:scale-105 transition-transform">{pc.avatar ? <img src={pc.avatar} className="w-full h-full object-cover" /> : pc.name[0]}</div>
                          <div className="space-y-3 mb-10 w-full"><h3 className="text-2xl font-black text-white truncate">{pc.name}</h3><p className="text-indigo-400 font-bold text-sm">@{pc.username}</p><div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-4"><Briefcase className="w-4 h-4" /><span className="font-bold uppercase tracking-widest">{pc.field || 'Mentor'}</span></div></div>
                          <button onClick={(e) => { e.stopPropagation(); onApproveUser(pc.id); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all">Tezkor Tasdiqlash</button>
                       </div>
                    ))}
                 </div>
              ) : (<div className="py-32 text-center"><CheckCircle2 className="w-20 h-20 text-indigo-500 mx-auto mb-8 opacity-20" /><p className="text-2xl font-black text-slate-700 uppercase tracking-widest">Yangi so'rovlar yo'q</p></div>)}
           </div>
        )}

        {/* SEASONS TAB */}
        {activeTab === 'seasons' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Mavsumlarni Boshqarish</h2>
              <p className="text-slate-500">Yangi mavsum boshlash yoki eskisini arxivlash.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Active Season Card - Redesigned */}
              <div className="group relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0a0a0c] p-6 md:p-14 text-center transition-all hover:border-indigo-500/30">
                {/* Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-600/20 blur-[60px]"></div>
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-600/20 blur-[60px]"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                   <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-600/30">
                      <CalendarDays className="h-10 w-10 text-white" />
                   </div>
                   
                   <h3 className="mb-2 text-4xl font-black tracking-tighter text-white md:text-5xl">
                      Mavsum #{seasons.find(s => s.id === activeSeasonId)?.number}
                   </h3>
                   
                   <div className="mb-10 flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Jarayonda</span>
                   </div>

                   <div className="grid w-full grid-cols-2 gap-4 mb-10">
                      <div className="rounded-3xl bg-white/5 p-4 border border-white/5">
                         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Boshlanish</p>
                         <p className="text-lg font-bold text-white">{seasons.find(s => s.id === activeSeasonId)?.startDate}</p>
                      </div>
                      <div className="rounded-3xl bg-white/5 p-4 border border-white/5 relative group/duration">
                         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Davomiyligi</p>
                         <div className="flex items-center justify-center gap-2">
                             <input 
                                type="number" 
                                min="1" 
                                max="12"
                                value={seasons.find(s => s.id === activeSeasonId)?.durationInMonths || 3}
                                onChange={(e) => onUpdateSeason(activeSeasonId, { durationInMonths: parseInt(e.target.value) || 3 })}
                                className="bg-transparent text-lg font-bold text-white w-12 outline-none border-b border-white/10 focus:border-indigo-500 transition-colors text-center"
                             />
                             <span className="text-lg font-bold text-white">Oy</span>
                         </div>
                         <Edit2 className="w-3 h-3 text-indigo-500 absolute top-4 right-4" />
                      </div>
                   </div>
                   
                   <button 
                    onClick={() => onStartNewSeason()} 
                    className="group/btn relative w-full overflow-hidden rounded-2xl bg-white py-5 text-center font-black uppercase tracking-widest text-indigo-950 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                   >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                         <Rocket className="h-5 w-5 transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" /> 
                         Yangi Mavsum
                      </span>
                      <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                   </button>
                </div>
              </div>

              {/* History List */}
              <div className="glass rounded-[3rem] border border-white/5 p-6 md:p-8">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 ml-2">Mavsumlar Tarixi</h4>
                <div className="space-y-4">
                  {seasons.map(season => (
                    <div key={season.id} onClick={() => onSwitchSeason(season.id)} className={`p-6 rounded-2xl border flex items-center justify-between cursor-pointer transition-all group/season ${season.id === activeSeasonId ? 'bg-indigo-600/20 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div>
                        <h5 className="text-xl font-black text-white">Mavsum #{season.number}</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{season.startDate} da boshlangan</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {seasons.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSeasonToDelete(season.id); }}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover/season:opacity-100 transition-all"
                                title="Mavsumni o'chirish"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        {season.id === activeSeasonId ? (
                          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[9px] font-black uppercase">Active</div>
                        ) : (
                          <div className="p-2 bg-white/5 rounded-full text-slate-500"><History className="w-4 h-4" /></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Global Xabarlar</h2>
              <p className="text-slate-500">Barcha foydalanuvchilarga yoki maxsus guruhlarga bildirishnoma yuborish.</p>
            </div>

            <div className="glass rounded-[3rem] border border-white/5 p-6 md:p-14">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Xabar Sarlavhasi</label>
                  <input 
                    type="text" 
                    value={messageForm.title}
                    onChange={e => setMessageForm({...messageForm, title: e.target.value})}
                    className="w-full bg-[#121214] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-indigo-600 transition-all"
                    placeholder="Masalan: Platformada texnik ishlar"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Xabar Turi</label>
                     <CustomDropdown
                        variant="compact"
                        className="w-full"
                        options={[
                            { value: 'info', label: 'Info (Ko\'k)', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
                            { value: 'success', label: 'Success (Yashil)', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
                            { value: 'warning', label: 'Warning (Sariq)', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> },
                            { value: 'urgent', label: 'Urgent (Qizil)', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> }
                        ]}
                        value={messageForm.type}
                        onChange={(val) => setMessageForm({...messageForm, type: val as any})}
                        placeholder="Xabar turini tanlang"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Qabul Qiluvchilar</label>
                     <CustomDropdown
                        variant="compact"
                        className="w-full"
                        options={[
                            { value: 'all', label: 'Barcha Foydalanuvchilar', icon: <Users className="w-4 h-4" /> },
                            { value: 'student', label: 'Faqat O\'quvchilar', icon: <UserCircle className="w-4 h-4" /> },
                            { value: 'curator', label: 'Faqat Kuratorlar', icon: <Briefcase className="w-4 h-4" /> }
                        ]}
                        value={messageForm.targetRole}
                        onChange={(val) => setMessageForm({...messageForm, targetRole: val as any})}
                        placeholder="Qabul qiluvchilarni tanlang"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Xabar Matni</label>
                  <textarea 
                    value={messageForm.message}
                    onChange={e => setMessageForm({...messageForm, message: e.target.value})}
                    className="w-full bg-[#121214] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-indigo-600 transition-all h-40 resize-none"
                    placeholder="Xabar mazmunini kiriting..."
                  />
                </div>

                <button 
                  onClick={handleSendMessage}
                  disabled={isSending || !messageForm.title || !messageForm.message}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Xabarni Yuborish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
             <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Tizim Sozlamalari</h2>
              <p className="text-slate-500">Platforma konfiguratsiyasini boshqarish.</p>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-[3rem] border border-white/5 p-6 md:p-10">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Shield className="w-6 h-6 text-indigo-500" /> Ro'yxatdan o'tish</h3>
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                   <div>
                      <p className="text-sm font-bold text-white mb-1">Yangi a'zolar qabuli</p>
                      <p className="text-xs text-slate-500">O'chirilganda, yangi foydalanuvchilar ro'yxatdan o'ta olmaydi.</p>
                   </div>
                   <button 
                    onClick={onToggleRegistration}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${isRegistrationOpen ? 'bg-green-500' : 'bg-slate-700'}`}
                   >
                     <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isRegistrationOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 mt-4">
                   <div>
                      <p className="text-sm font-bold text-white mb-1">Yangi kuratorlar qabuli</p>
                      <p className="text-xs text-slate-500">O'chirilganda, faqat student bo'lib ro'yxatdan o'tish mumkin bo'ladi.</p>
                   </div>
                   <button 
                    onClick={onToggleCuratorRegistration}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${isCuratorRegistrationOpen ? 'bg-green-500' : 'bg-slate-700'}`}
                   >
                     <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isCuratorRegistrationOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
              </div>

              <div className="glass rounded-[3rem] border border-white/5 p-6 md:p-10">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Bell className="w-6 h-6 text-purple-500" /> Bildirishnomalar</h3>
                
                <div className="space-y-4">
                   {/* Loop through settings */}
                   {[
                     { key: 'onNewCuratorRequest', label: 'Yangi kurator so\'rovi', desc: 'Kurator ro\'yxatdan o\'tganda email xabar olish.' },
                     { key: 'onSeasonStart', label: 'Mavsum yangilanishi', desc: 'Mavsum o\'zgarganda avtomatik xabar yuborish.' }
                   ].map((setting) => (
                     <div key={setting.key} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                            <p className="text-sm font-bold text-white mb-1">{setting.label}</p>
                            <p className="text-xs text-slate-500">{setting.desc}</p>
                        </div>
                        <button 
                          onClick={() => setNotificationSettings(prev => ({...prev, [setting.key]: !prev[setting.key as keyof typeof notificationSettings]}))}
                          className={`w-14 h-8 rounded-full p-1 transition-colors ${notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-indigo-600' : 'bg-slate-700'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                     </div>
                   ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/5">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">Admin Email</label>
                      <input 
                        type="email" 
                        value={notificationSettings.adminEmail}
                        onChange={e => setNotificationSettings({...notificationSettings, adminEmail: e.target.value})}
                        className="w-full bg-[#121214] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-indigo-600 transition-all"
                      />
                   </div>
                   <button 
                     onClick={handleSaveNotificationSettings}
                     disabled={isSavingSettings}
                     className="w-full mt-6 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                   >
                     {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                     Sozlamalarni Saqlash
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedUserForView && (
           <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl overflow-y-auto py-10 px-4 md:px-10 animate-in fade-in zoom-in duration-500">
              <div className="flex min-h-full items-center justify-center">
                 <div className="glass w-full max-w-5xl border border-white/5 rounded-[3rem] md:rounded-[4.5rem] relative shadow-[0_0_100px_rgba(79,70,229,0.15)] overflow-hidden">
                    <button onClick={() => setSelectedUserForView(null)} className="absolute top-4 right-4 md:top-8 md:right-8 p-3.5 bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-full transition-all border border-white/5 z-30 group"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
                    <div className="p-6 md:p-16">
                       <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 mb-10 md:mb-16 border-b border-white/5 pb-10 md:pb-16">
                          <div className="relative group shrink-0">
                             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[3.5rem] md:rounded-[4.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                             <div className="w-32 h-32 md:w-56 md:h-56 rounded-[3rem] md:rounded-[4.5rem] bg-[#121214] border-4 border-white/5 overflow-hidden flex items-center justify-center text-indigo-400 text-5xl md:text-7xl font-black shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02] duration-500">
                                {selectedUserForView.avatar ? (<img src={selectedUserForView.avatar} className="w-full h-full object-cover" alt={selectedUserForView.name} />) : selectedUserForView.name[0]}
                                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-[#121214] z-20">
                                   {selectedUserForView.status === 'active' ? <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Clock className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />}
                                </div>
                             </div>
                          </div>
                          <div className="text-center lg:text-left flex-1 space-y-6">
                             <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                                   <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getRoleStyle(selectedUserForView.role)}`}>{selectedUserForView.role}</span>
                                   <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getUserStatusStyle(selectedUserForView.status)}`}>{selectedUserForView.status === 'active' ? 'Faol' : selectedUserForView.status === 'inactive' ? 'Passiv' : 'Kutilmoqda'}</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none break-words">{selectedUserForView.name}</h2>
                                <p className="text-xl md:text-3xl font-bold text-slate-500 tracking-tight break-all">@{selectedUserForView.username}</p>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                <div className="flex items-center gap-4 bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.06] transition-all"><div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400"><Mail className="w-5 h-5" /></div><div className="overflow-hidden"><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-1">Elektron Pochta</p><p className="text-slate-300 font-bold text-sm truncate">{selectedUserForView.email}</p></div></div>
                                <div className="flex items-center gap-4 bg-white/[0.03] p-5 rounded-3xl border border-white/5 hover:bg-white/[0.06] transition-all"><div className="p-3 bg-purple-600/10 rounded-2xl text-purple-400"><Briefcase className="w-5 h-5" /></div><div className="overflow-hidden"><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-1">Mutaxassislik</p><p className="text-slate-300 font-bold text-sm truncate">{selectedUserForView.field || 'Generalist'}</p></div></div>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                          <div className="lg:col-span-2 space-y-8">
                             <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><FileText className="w-5 h-5 text-indigo-500" /> Professional Bio</h4>
                                <div className="relative group"><div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition-all"></div><div className="relative p-6 md:p-10 bg-[#121214]/50 border border-white/5 rounded-[2.5rem] min-h-[160px]"><Quote className="w-10 h-10 text-white/5 absolute top-8 left-8" /><p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-medium italic relative z-10 whitespace-pre-wrap">"{selectedUserForView.longBio || 'Ma\'lumot kiritilmagan.'}"</p><Quote className="w-10 h-10 text-white/5 absolute bottom-8 right-8 rotate-180" /></div></div>
                             </div>
                             <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><Info className="w-5 h-5 text-indigo-500" /> Mutaxassislik Haqida</h4>
                                <div className="p-8 bg-[#121214]/50 border border-white/5 rounded-[2.5rem]">
                                    <p className="text-lg text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">"{selectedUserForView.fieldDescription || "Ma'lumot kiritilmagan."}"</p>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><Link2 className="w-5 h-5 text-purple-500" /> Buddy Tarmoq Ma'lumotlari</h4>
                                {selectedUserForView.role === 'student' ? (<div className="p-8 bg-purple-600/5 border border-purple-500/10 rounded-3xl flex flex-col md:flex-row items-center gap-8 group cursor-pointer hover:border-purple-500/30 transition-all" onClick={() => { const curator = getAssignedCurator(selectedUserForView); if (curator) setSelectedUserForView(curator); }}><div className="w-24 h-24 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">{getAssignedCurator(selectedUserForView)?.avatar ? (<img src={getAssignedCurator(selectedUserForView)?.avatar} className="w-full h-full object-cover" />) : <UserCircle className="w-12 h-12 text-slate-700" />}</div><div className="text-center md:text-left"><p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-1">Mas'ul Kurator (Buddy)</p><h5 className="text-2xl font-black text-white mb-2">{getAssignedCurator(selectedUserForView)?.name || 'Noma\'lum'}</h5><p className="text-sm text-slate-400 font-medium">Bu o'quvchi {getAssignedCurator(selectedUserForView)?.name || 'mentor'} nazorati ostida ish olib bormoqda.</p></div><div className="ml-auto hidden md:block"><ChevronRight className="w-8 h-8 text-slate-800 group-hover:text-purple-500 transition-colors" /></div></div>) : selectedUserForView.role === 'curator' ? (<div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{getAssignedStudents(selectedUserForView).length > 0 ? (getAssignedStudents(selectedUserForView).map(student => (<div key={student.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group/st" onClick={() => setSelectedUserForView(student)}><div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-xs font-black text-indigo-400 group-hover/st:bg-indigo-600 group-hover/st:text-white transition-all">{student.name[0]}</div><div className="truncate"><p className="text-sm font-black text-white truncate">{student.name}</p><p className="text-[10px] text-slate-500 font-bold">O'quvchi</p></div></div>))) : (<div className="col-span-full py-10 text-center border-2 border-dashed border-white/5 rounded-3xl"><p className="text-slate-700 font-bold text-xs uppercase tracking-widest">Hozircha o'quvchilar biriktirilmagan</p></div>)}</div></div>) : (<div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl text-center"><p className="text-slate-500 font-bold text-sm italic">Adminlar global nazorat huquqiga ega.</p></div>)}
                             </div>

                             <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><Quote className="w-5 h-5 text-indigo-500" /> Motivatsion So'z</h4>
                                <div className="p-8 bg-[#121214]/50 border border-white/5 rounded-[2.5rem]">
                                    <p className="text-xl text-white leading-relaxed font-black italic text-center whitespace-pre-wrap">"{selectedUserForView.motivationQuote || "Harakatda barakat!"}"</p>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-10">
                             {!isDirectMessaging ? (
                                <>
                                  <div className="space-y-6"><h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><Code className="w-5 h-5 text-purple-500" /> Texnik Stack</h4><div className="flex flex-wrap gap-2.5">{selectedUserForView.skills && selectedUserForView.skills.length > 0 ? (selectedUserForView.skills.map((skill, i) => (<span key={i} className="px-5 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-default shadow-sm group/skill">{skill}</span>))) : (<div className="w-full p-6 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-700 font-bold text-xs uppercase tracking-widest">Ma'lumot yo'q</div>)}</div></div>
                                  
                                  {/* STATUS MANAGEMENT SECTION - Only for Curators */}
                                  {selectedUserForView.role === 'curator' && (
                                     <div className="space-y-4 pt-6 border-t border-white/5">
                                        <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">Statusni Boshqarish</h4>
                                        <div className="flex gap-2">
                                           <button 
                                             onClick={() => { onChangeStatus?.(selectedUserForView.id, 'active'); setSelectedUserForView(prev => prev ? {...prev, status: 'active'} : null); }}
                                             className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border transition-all ${selectedUserForView.status === 'active' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                           >Aktiv</button>
                                           <button 
                                             onClick={() => { onChangeStatus?.(selectedUserForView.id, 'inactive'); setSelectedUserForView(prev => prev ? {...prev, status: 'inactive'} : null); }}
                                             className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase border transition-all ${selectedUserForView.status === 'inactive' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                           >Passiv</button>
                                        </div>
                                     </div>
                                  )}

                                  {!selectedUserForView.isApproved && selectedUserForView.role === 'curator' && (
                                     <div className="pt-2"><button onClick={() => { onApproveUser(selectedUserForView.id); setSelectedUserForView(prev => prev ? {...prev, isApproved: true, status: 'active'} : null); }} className="w-full py-6 bg-green-600 hover:bg-green-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all hover:scale-[1.02]"><UserCheck className="w-5 h-5" /> Kuratorni Tasdiqlash</button></div>
                                  )}
                                  <div className="space-y-4 pt-8 border-t border-white/5">
                                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6">Ijtimoiy Tarmoqlar</h4>
                                      <div className="flex flex-wrap gap-4">
                                          {selectedUserForView.socialLinks && selectedUserForView.socialLinks.length > 0 ? (
                                              selectedUserForView.socialLinks.map((link, index) => (
                                                  <a 
                                                      key={index} 
                                                      href={link.linkUrl} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all group"
                                                  >
                                                      {link.iconUrl ? (
                                                          <img src={link.iconUrl} className="w-6 h-6 object-cover rounded-md" />
                                                      ) : (
                                                          <Link2 className="w-5 h-5 text-slate-500 group-hover:text-black transition-colors" />
                                                      )}
                                                  </a>
                                              ))
                                          ) : (
                                              <div className="w-full p-6 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-700 font-bold text-xs uppercase tracking-widest">
                                                  Tarmoqlar ulanmagan
                                              </div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="pt-6"><button onClick={() => setIsDirectMessaging(true)} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"><Send className="w-4 h-4" /> Xabar yuborish</button></div>
                                </>
                             ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.4em] flex items-center gap-3">
                                      <Mail className="w-5 h-5" /> Shaxsiy xabar
                                    </h4>
                                    <button onClick={() => setIsDirectMessaging(false)} className="text-slate-500 hover:text-white transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Sarlavha</label>
                                      <input type="text" className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 px-5 text-white text-sm outline-none focus:border-indigo-600 transition-all" placeholder="Masalan: Maqsadlar haqida" value={directMessageForm.title} onChange={e => setDirectMessageForm({...directMessageForm, title: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Xabar turi</label>
                                      <CustomDropdown
                                        options={[
                                          { value: 'info', label: 'Info', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> },
                                          { value: 'urgent', label: 'Muhim', icon: <div className="w-2 h-2 rounded-full bg-red-500" /> },
                                          { value: 'success', label: 'Natija', icon: <div className="w-2 h-2 rounded-full bg-green-500" /> },
                                          { value: 'warning', label: 'Ogohlantirish', icon: <div className="w-2 h-2 rounded-full bg-yellow-500" /> }
                                        ]}
                                        value={directMessageForm.type}
                                        onChange={(val) => setDirectMessageForm({...directMessageForm, type: val as any})}
                                        placeholder="Turini tanlang"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest ml-1">Xabar matni</label>
                                      <textarea className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl py-4 px-5 text-white text-sm outline-none focus:border-indigo-600 transition-all h-32 resize-none" placeholder="Bu yerga yozing..." value={directMessageForm.message} onChange={e => setDirectMessageForm({...directMessageForm, message: e.target.value})} />
                                    </div>
                                    <button onClick={handleSendDirectMessage} disabled={isSending || !directMessageForm.title || !directMessageForm.message} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                      {isSending ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}Yuborish
                                    </button>
                                    <button onClick={() => setIsDirectMessaging(false)} className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Bekor qilish</button>
                                  </div>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
        {/* EDIT STUDENT MODAL */}
        {editingProgress && (
          <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="glass w-full max-w-4xl border border-white/5 rounded-[3rem] p-6 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setEditingProgress(null)} 
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl shrink-0">
                    {editingProgress.studentName[0]}
                </div>
                <div className="overflow-hidden">
                    <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight truncate">{editingProgress.studentName}</h3>
                    <p className="text-[9px] md:text-[11px] font-black uppercase text-indigo-400 tracking-[0.2em] mt-2 truncate">Hafta #0{editingProgress.weekNumber} Monitoringini Tahrirlash</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 block">Uchrashuv vaqti va davomat</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="datetime-local" 
                                value={editPlanForm.meetingDay}
                                onChange={(e) => setEditPlanForm(prev => ({ ...prev, meetingDay: e.target.value }))}
                                className="w-full sm:flex-1 bg-[#121214] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                            />
                            <button 
                                onClick={() => setEditPlanForm(prev => ({ ...prev, attended: !prev.attended }))}
                                className={`w-full sm:w-auto px-6 py-4 sm:py-0 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${editPlanForm.attended ? 'bg-green-500 text-white border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                            >
                                {editPlanForm.attended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                {editPlanForm.attended ? 'Ishtirok Etdi' : 'Ishtirok Etmadi'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 block">Haftalik maqsad</label>
                        <textarea 
                            value={editPlanForm.weeklyGoal}
                            onChange={(e) => setEditPlanForm(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                            className="w-full bg-[#121214] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px] resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 block">Monitoring holati</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['Bajarilmoqda', 'Hal qilindi', 'Kutilmoqda', 'Bajarmadi'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setEditPlanForm(prev => ({ ...prev, status }))}
                                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${editPlanForm.status === status ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-[#121214] text-slate-500 border-white/5 hover:bg-white/5'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 block">Asosiy muammo</label>
                        <textarea 
                            value={editPlanForm.difficulty}
                            onChange={(e) => setEditPlanForm(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full bg-[#121214] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[150px] resize-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-1 block">Tavsiya qilingan yechim</label>
                        <textarea 
                            value={editPlanForm.solution}
                            onChange={(e) => setEditPlanForm(prev => ({ ...prev, solution: e.target.value }))}
                            className="w-full bg-[#121214] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[150px] resize-none"
                        />
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-sm py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" /> Monitoringni Saqlash
                </button>
                <button 
                  onClick={() => setEditingProgress(null)}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-300 font-black uppercase tracking-widest text-sm rounded-2xl transition-all border border-white/5"
                >
                  Bekor Qilish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Season Confirmation Modal */}
        {seasonToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Mavsumni o'chirish</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Haqiqatan ham bu mavsumni o'chirmoqchimisiz? Barcha bog'liq ma'lumotlar saqlanib qoladi, lekin mavsum ro'yxatdan o'chiriladi.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSeasonToDelete(null)}
                    className="flex-1 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button 
                    onClick={() => {
                      onDeleteSeason(seasonToDelete);
                      setSeasonToDelete(null);
                    }}
                    className="flex-1 py-4 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;
