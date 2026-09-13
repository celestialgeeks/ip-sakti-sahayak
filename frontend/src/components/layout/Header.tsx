"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("app_language");
    if (saved) setLanguage(saved);
  }, []);

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("app_language", val);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-portal-border shadow-sm">
      {/* National Tricolor Strip */}
      <div className="h-[3px] w-full tricolor-stripe"></div>
      
      {/* Accessibility & Official Apex Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 sm:px-6 py-1 flex items-center justify-between font-label border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-white tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF9933]"></span>
            भारत सरकार | GOVERNMENT OF INDIA
          </span>
          <span className="hidden md:inline-block text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">आयुष मंत्रालय | Ministry of Ayush</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Accessibility Font Controls */}
          <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
            <span className="text-slate-400 mr-1 text-[10px] uppercase">Font Size:</span>
            <button className="px-1 py-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors" title="Decrease Font">A-</button>
            <button className="px-1 py-0.5 rounded bg-slate-800 text-white font-bold" title="Standard Font">A</button>
            <button className="px-1 py-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors" title="Increase Font">A+</button>
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center gap-1 font-semibold text-slate-200">
            <span 
              className={`hover:underline cursor-pointer ${language === 'en' ? 'text-white' : 'text-slate-300 font-normal'}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </span>
            <span className="text-slate-600">|</span>
            <span 
              className={`hover:underline cursor-pointer ${language === 'hi' ? 'text-white' : 'text-slate-300 font-normal'}`}
              onClick={() => handleLanguageChange('hi')}
            >
              हिन्दी
            </span>
          </div>
        </div>
      </div>

      {/* Primary Nav Header */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Ayush & Lion Emblem Title */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <img 
              alt="State Emblem of India" 
              className="h-11 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRRLbJAeuvaAbipe1qusQWrdyjYbkPpSRTQjTFXKDFGTK2VASQpi2mYI-njar5O2de332KW2YXGlfYE--ZP_o2nmp9nWZwxH09PW7GOZ-bZRsXfshvXvCXQuSyZpF8qpxgrxh4hG644v4ntLctywctQRnC2MULsjROmIEo-dPIhwt-ry0sWWDg-fEG1UMencs_sIB5GrlPRkv-6qy8wlB9kzvmUJ5SxPyK5PqOtaLeSJh2DJOcOfaglH6vt16C31DPQQ" 
            />
            <div className="flex flex-col justify-center">
              <div className="text-[13px] font-semibold tracking-tight text-slate-700 leading-tight font-heading">भारत सरकार</div>
              <div className="text-[17px] font-bold tracking-tight text-[#002855] leading-tight font-heading">आयुष मंत्रालय</div>
              <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                Ministry of Ayush <span className="text-slate-300">|</span> IP-SAKTI Sahayak
              </div>
            </div>
          </Link>
        </div>

        {/* Right Header Indicators & Actions */}
        <div className="flex items-center gap-3">
          {/* Engine Version Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[12px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse"></span>
            Online
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0b3c5d] transition-colors" 
              title="Export Certified Ayush Dossier"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
            <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0b3c5d] transition-colors" title="National Patent Cell Directory">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            
            {/* Profile Badge */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#0b3c5d] flex items-center justify-center text-white shadow-sm font-semibold text-[13px]">
                GOI
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
