"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";

const devTeam = [
  { name: "Vyomesh Joshi", role: "UI/UX + Frontend", initials: "VJ", image: "/team/Vyomesh.jpg" },
  { name: "Lakkshya Jha", role: "Frontend + Backend", initials: "LJ", image: "/team/Lakkshya.jpg" },
  { name: "Devyansh Arya", role: "Backend + Deployment", initials: "DA", image: "/team/Devyansh.jpg" },
];

const designTeam = [
  { name: "Vidhish Sangawan", role: "System Design & Ideation", initials: "VS", image: "/team/Vidhish.jpg" },
  { name: "Bhoomi Garg", role: "System Design & Ideation", initials: "BG", image: "/team/Bhoomi.jpg" },
  { name: "Deeya Mehta", role: "System Design & Ideation", initials: "DM", image: "/team/Deeya.jpg" },
  { name: "Diya Jain", role: "System Design & Ideation", initials: "DJ", image: "/team/diya.jpg" },
];

export default function TeamPage() {
  return (
    <div className="w-full min-h-screen pb-32 relative overflow-hidden bg-transparent">
      {/* HEADER DESIGN */}
      <div className="relative pt-24 pb-4 flex flex-col items-center justify-center">
        {/* Faded Background Word */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0 w-full overflow-hidden flex justify-center px-4">
          <h1 className="text-[10vw] sm:text-[11vw] md:text-[13vw] lg:text-[11vw] xl:text-[12vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-400 to-neutral-800 opacity-[0.05] dark:from-neutral-200 dark:to-neutral-600 leading-[0.8] whitespace-nowrap">
            DEVELOPERS
          </h1>
        </div>
        
        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white relative z-10 tracking-tight text-center">
          Our Development Team
        </h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 mt-12">
        {/* ROW 1 — DEVELOPMENT */}
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {devTeam.map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>
        </div>

        {/* ROW 2 — SYSTEM DESIGN & Ideation */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {designTeam.map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ member }: { member: any }) {
  return (
    <div className="group relative rounded-2xl bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800/80 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.05)] hover:border-purple-500/30 flex flex-col items-center text-center">
      {/* Subtle glow effect behind card on hover (Optional enhancement for premium feel) */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Profile Image (Dynamic fallback or actual Image) */}
      <div className="relative mb-6 z-10 w-full flex justify-center mt-2">
        {/* Glow behind avatar */}
        <div className="absolute inset-0 bg-purple-500/20 rounded-[32px] blur-xl scale-[0.8] opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
        <div className="relative h-28 w-28 rounded-[32px] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center text-3xl font-bold text-neutral-500 dark:text-neutral-400 shadow-inner border border-neutral-200/50 dark:border-neutral-700/50 transform group-hover:scale-105 transition-transform duration-500 overflow-hidden">
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover"
            />
          ) : (
            member.initials
          )}
        </div>
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center mt-2">
        <h3 className="text-[22px] font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {member.name}
        </h3>
        <p className="text-[15px] font-medium text-neutral-500 dark:text-neutral-400 mb-8">
          {member.role}
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-5 text-neutral-400 dark:text-neutral-500">
          <a href="#" className="hover:text-[#0A66C2] dark:hover:text-[#3b82f6] transition-colors hover:scale-110 transform duration-200">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors hover:scale-110 transform duration-200">
            <Github className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors hover:scale-110 transform duration-200">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
