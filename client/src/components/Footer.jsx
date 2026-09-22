import React from 'react';
import { ShieldCheck, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-base mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>ICCT Cainta - Lost & Found Directory</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An automated, web-based lost and found platform designed to help students, faculty, and campus staff report, search, and recover missing items with interactive campus map integration.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Campus Location</h4>
            <div className="flex items-start space-x-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>ICCT Colleges - Cainta Campus<br />V.V. Soliven Complex, Cainta, Rizal, Philippines</span>
            </div>
            <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official campus security drop-off: Main Gate Guard House</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Academic Project Details</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><span className="text-slate-300 font-medium">Proponent:</span> Yeinnee Ruby Lavado</li>
              <li><span className="text-slate-300 font-medium">Section:</span> LFCA411N120</li>
              <li><span className="text-slate-300 font-medium">Subject:</span> IPT2 (Integrative Programming & Technologies 2)</li>
              <li><span className="text-slate-300 font-medium">Instructor:</span> Sir Noel Montecillo</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ICCT Cainta Lost & Found Directory. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for ICCT Cainta Community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
