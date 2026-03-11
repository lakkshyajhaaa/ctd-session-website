"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Target, Zap, Shield, Crown } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Achievements</h1>
        <p className="text-neutral-500 mt-2">Unlock badges by dominating your training sessions and maintaining perfect attendance.</p>
      </div>

      {/* Primary Showcase */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-neutral-900 shadow-sm relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1 rounded-xl transition-all duration-150 hover:shadow-md">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Top 5% Performer</CardTitle>
            <CardDescription className="text-purple-600/80 dark:text-purple-400/80">Current Cohort Standing</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              You are currently outperforming 95% of students in your enrolled CTD training tracks based on attendance and validation scores.
            </p>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm transition-all duration-150 hover:shadow-md col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Level 14 Scholar</CardTitle>
                <CardDescription>2,450 / 3,000 XP</CardDescription>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-purple-100 dark:border-purple-900 flex items-center justify-center bg-white dark:bg-neutral-950 shadow-sm flex-shrink-0">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">14</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: "82%" }} />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-orange-500" />
                550 XP needed to reach Level 15
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Grid */}
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white pt-4">Unlocked Badges</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm transition-all duration-150 hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Early Bird</h4>
              <p className="text-xs text-neutral-500 mt-1">Attended 10 morning sessions</p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 pointer-events-none">Unlocked</Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm transition-all duration-150 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Ironclad</h4>
              <p className="text-xs text-neutral-500 mt-1">100% attendance for 30 days</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 pointer-events-none">Unlocked</Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm transition-all duration-150 hover:border-green-500/50 dark:hover:border-green-500/50 hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Sharpshooter</h4>
              <p className="text-xs text-neutral-500 mt-1">Passed 5 skill checks flawlessly</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 pointer-events-none">Unlocked</Badge>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all duration-150 hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Star className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Mastery</h4>
              <p className="text-xs text-neutral-500 mt-1">Complete all CTD core tracks</p>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 mt-2">
              <div className="bg-neutral-400 h-1.5 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
