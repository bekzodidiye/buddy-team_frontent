
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-32 bg-[#0a0a0c] relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-[10px] blur-[120px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-purple-500 font-black tracking-widest uppercase text-sm mb-4">Bog'lanish</h2>
          <p className="text-5xl md:text-7xl font-black mb-8 text-white">Savollaringiz <span className="gradient-text">Bormi?</span></p>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Bizning jamoaga qo'shilish yoki hamkorlik qilish bo'yicha har qanday savollaringizni kutamiz.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 md:p-8 glass rounded-[10px] border border-white/5 hover:border-purple-500/30 transition-all group">
              <div className="w-14 h-14 bg-indigo-600/20 rounded-[10px] flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Elektron Pochta</h4>
              <p className="text-slate-400 text-sm">hello@buddyteam.uz</p>
            </div>

            <div className="p-6 md:p-8 glass rounded-[10px] border border-white/5 hover:border-purple-500/30 transition-all group">
              <div className="w-14 h-14 bg-purple-600/20 rounded-[10px] flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Telegram Kanal</h4>
              <p className="text-slate-400 text-sm">@buddyteam_official</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form className="p-6 md:p-10 glass rounded-[10px] border border-white/5 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Ismingiz</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-[10px] py-4 px-6 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Asadbek..." />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Emailingiz</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-[10px] py-4 px-6 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="example@mail.com" />
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Xabaringiz</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-[10px] py-4 px-6 text-white focus:outline-none focus:border-purple-500 transition-colors h-40 resize-none" placeholder="Qanday yordam bera olamiz?"></textarea>
              </div>
              <button className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-[10px] shadow-xl shadow-purple-600/20 flex items-center justify-center space-x-3 hover:scale-[1.02] transition-transform active:scale-95">
                <Send className="w-5 h-5" />
                <span>Xabar Yuborish</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
