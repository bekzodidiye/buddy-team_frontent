
import React from 'react';
import Hero from './Hero';
import { Page } from '../types';
import { Shield, Users, Heart, Star, Sparkles, Zap, MessageSquare, ArrowRight, Lock } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: Page) => void;
  onAuthNavigate: (mode: 'login' | 'signup') => void;
  isRegistrationOpen?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onAuthNavigate, isRegistrationOpen = true }) => {
  return (
    <div className="bg-[#0a0a0c]">
      <Hero />
      
      {/* About Buddy Section - Deep Information */}
      <section className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 md:mb-32">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-indigo-500/10 rounded-xl mb-6 border border-indigo-500/20">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] md:text-xs font-black text-indigo-300 uppercase tracking-widest">Biz kimmiz?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 md:mb-8 text-white leading-tight">
                Buddy — Bu shunchaki jamoa emas, <br />
                <span className="gradient-text">bu Oila.</span>
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0">
                Buddy Team 2023-yilda o'zaro ishonch va do'stlik poydevorida tashkil topgan. Bizning logotipimizdagi mushuk va kuchukcha tasviri tasodifiy emas — u qarama-qarshi xarakterlar ham bitta maqsad yo'lida do'st bo'la olishini anglatadi.
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10 max-w-md mx-auto lg:mx-0">
                <div className="p-4 md:p-6 glass rounded-2xl md:rounded-3xl border border-white/5 shadow-xl">
                   <h4 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2">50+</h4>
                   <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bitiruvchilar</p>
                </div>
                <div className="p-4 md:p-6 glass rounded-2xl md:rounded-3xl border border-white/5 shadow-xl">
                   <h4 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2">12</h4>
                   <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Barcha Kuratorlar</p>
                </div>
              </div>
              
              {isRegistrationOpen ? (
                <button 
                  onClick={() => onAuthNavigate('signup')}
                  className="flex items-center justify-center lg:justify-start space-x-3 text-indigo-400 font-black hover:text-indigo-300 transition-colors group w-full lg:w-auto"
                >
                  <span>Hoziroq bizga qo'shiling</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-3 text-slate-500 font-bold italic">
                   <Lock className="w-4 h-4" />
                   <span>Mavsumga qabul yopilgan</span>
                </div>
              )}
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-square glass rounded-[40px] md:rounded-[60px] border border-white/5 shadow-2xl overflow-hidden p-3 md:p-4 relative group max-w-md mx-auto">
                 <div className="absolute inset-0 bg-indigo-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200" 
                  alt="Our Vision" 
                  className="w-full h-full object-cover rounded-[30px] md:rounded-[50px] grayscale hover:grayscale-0 transition-all duration-700"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                       <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-500 fill-current" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20 md:mb-32">
            {[
              {
                title: "Bizning Missiya",
                desc: "Har bir insonga o'z potensialini topishda do'stona ko'mak berish.",
                icon: <Zap className="w-6 h-6 text-yellow-400" />
              },
              {
                title: "Do'stlik Ustuvor",
                desc: "Bizda usto-shogird emas, do'st-buddy munosabatlari rivojlangan.",
                icon: <Heart className="w-6 h-6 text-pink-400" />
              },
              {
                title: "Ochiq Muloqot",
                desc: "Har bir muammo birgalikda, AI va jamoaviy tahlil bilan hal etiladi.",
                icon: <MessageSquare className="w-6 h-6 text-blue-400" />
              }
            ].map((card, i) => (
              <div key={i} className="p-8 md:p-10 glass rounded-[32px] md:rounded-[40px] border border-white/5 shadow-xl hover:-translate-y-2 transition-all">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 md:mb-8">
                  {card.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-3 md:mb-4">{card.title}</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center p-6 md:p-16 glass rounded-3xl md:rounded-[60px] border border-white/5 shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 -z-10"></div>
             <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-400 mx-auto mb-4 md:mb-6" />
             <h2 className="text-3xl md:text-4xl font-black text-white mb-4 md:mb-6">Tayyormisiz?</h2>
             <p className="text-sm md:text-base text-slate-400 mb-8 md:mb-10 max-w-xl mx-auto font-medium">
               Bizning jamoa va kuratorlar ish rejasi bilan tanishish uchun bo'limlarga o'ting.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
                <button 
                  onClick={() => onNavigate('team')}
                  className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-white text-[#0a0a0c] font-black rounded-xl md:rounded-2xl hover:scale-105 transition-transform text-xs md:text-sm"
                >
                  Kuratorlarni Ko'rish
                </button>
                {isRegistrationOpen ? (
                  <button 
                    onClick={() => onAuthNavigate('signup')}
                    className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-transform text-xs md:text-sm"
                  >
                    O'quvchi bo'lish
                  </button>
                ) : (
                  <button 
                    onClick={() => onAuthNavigate('login')}
                    className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-white/5 text-slate-400 font-black rounded-xl md:rounded-2xl border border-white/5 transition-transform text-xs md:text-sm"
                  >
                    Tizimga kirish
                  </button>
                )}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
