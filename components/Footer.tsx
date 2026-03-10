
import React from 'react';
import { Instagram, Facebook, Youtube, Sparkles, MapPin, Phone, Mail } from 'lucide-react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo & About */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[10px]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">Buddy<span className="text-purple-500">Team</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Bizning logotipimizdagi mushuk va kuchukcha kabi biz ham bir-birimizga va sizga tayanchmiz. Birgalikda eng yaxshi natijalarga erishamiz!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 rounded-[10px] bg-white/5 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-white/5"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-12 h-12 rounded-[10px] bg-white/5 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-white/5"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-12 h-12 rounded-[10px] bg-white/5 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all border border-white/5"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Navigatsiya</h4>
            <ul className="space-y-4">
              <li><button onClick={() => onNavigate('home')} className="text-slate-400 text-sm hover:text-purple-400 transition-colors">Asosiy sahifa</button></li>
              <li><button onClick={() => onNavigate('features')} className="text-slate-400 text-sm hover:text-purple-400 transition-colors">Xizmatlarimiz</button></li>
              <li><button onClick={() => onNavigate('team')} className="text-slate-400 text-sm hover:text-purple-400 transition-colors">Bizning kuratorlar</button></li>
              <li><button onClick={() => onNavigate('contact')} className="text-slate-400 text-sm hover:text-purple-400 transition-colors">Bog'lanish</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Siz uchun</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-500 text-sm">Toshkent sh., Buddy Headquarters</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-500 text-sm">+998 90 123 45 67</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="text-slate-500 text-sm">info@buddyteam.uz</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Haftalik Insight</h4>
            <p className="text-slate-500 text-sm mb-6">Texnologik yangiliklardan birinchilardan bo'lib xabardor bo'ling.</p>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Email..." 
                className="bg-white/5 border border-white/10 rounded-[10px] py-3 px-4 text-sm focus:outline-none focus:border-purple-500 w-full"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 rounded-[10px] transition-all shadow-lg shadow-purple-600/20 font-bold">OK</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Buddy Team. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
