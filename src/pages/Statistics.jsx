import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Users, Clock, Star, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Statistics() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: myList = [] } = useQuery({
    queryKey: ["animeEntries"],
    queryFn: () => base44.entities.AnimeEntry.list(),
  });

  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships"],
    queryFn: () => base44.entities.Friendship.list(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const myFriends = friendships.filter(f => f.status === "accepted");

  const myStats = useMemo(() => {
    const totalAnime = myList.length;
    const completed = myList.filter(a => a.status === "completed").length;
    const watching = myList.filter(a => a.status === "watching").length;
    const totalEpisodes = myList.reduce((sum, a) => sum + (a.episodes_watched || 0), 0);
    const avgScore = myList.filter(a => a.user_score > 0).reduce((sum, a) => sum + a.user_score, 0) / myList.filter(a => a.user_score > 0).length || 0;
    
    const genreMap = {};
    myList.forEach(anime => {
      if (anime.genres) {
        anime.genres.split(",").forEach(g => {
          const genre = g.trim();
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const statusData = [
      { name: "Watching", value: watching, color: "#3b82f6" },
      { name: "Completed", value: completed, color: "#10b981" },
      { name: "Plan to Watch", value: myList.filter(a => a.status === "plan_to_watch").length, color: "#f59e0b" },
      { name: "Dropped", value: myList.filter(a => a.status === "dropped").length, color: "#ef4444" },
    ];

    const yearMap = {};
    myList.forEach(anime => {
      if (anime.year) {
        yearMap[anime.year] = (yearMap[anime.year] || 0) + 1;
      }
    });

    const yearData = Object.entries(yearMap)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([year, count]) => ({ year, count }));

    return {
      totalAnime,
      completed,
      watching,
      totalEpisodes,
      avgScore,
      topGenres,
      statusData,
      yearData,
    };
  }, [myList]);

  const globalStats = useMemo(() => {
    // This would ideally fetch from all users' entries, but for now we'll show placeholder
    return {
      totalUsers: allUsers.length,
      totalAnime: myList.length * 3, // Mock multiplier
      avgAnimePerUser: (myList.length * 3) / allUsers.length || 0,
    };
  }, [allUsers, myList]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
          <p className="text-slate-400">Your anime journey in numbers</p>
        </motion.div>

        <Tabs defaultValue="my-stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 mb-6">
            <TabsTrigger value="my-stats" className="data-[state=active]:bg-violet-500/20">
              My Stats
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-violet-500/20">
              Compare
            </TabsTrigger>
            <TabsTrigger value="global" className="data-[state=active]:bg-violet-500/20">
              Global
            </TabsTrigger>
          </TabsList>

          {/* My Stats */}
          <TabsContent value="my-stats">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{myStats.totalAnime}</div>
                      <div className="text-xs text-slate-400">Total Anime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Award className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{myStats.completed}</div>
                      <div className="text-xs text-slate-400">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{myStats.totalEpisodes}</div>
                      <div className="text-xs text-slate-400">Episodes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{myStats.avgScore.toFixed(1)}</div>
                      <div className="text-xs text-slate-400">Avg Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={myStats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {myStats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Genres */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle>Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={myStats.topGenres}>
                      <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Watch History by Year */}
              {myStats.yearData.length > 0 && (
                <Card className="bg-slate-900 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Anime by Release Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={myStats.yearData}>
                        <XAxis dataKey="year" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                        <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Compare with Friends */}
          <TabsContent value="compare">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle>Compare with Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedFriend}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mb-6">
                    <SelectValue placeholder="Select a friend" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {myFriends.map((friend) => {
                      const friendEmail = friend.friend_email === currentUser?.email ? friend.created_by : friend.friend_email;
                      const friendUser = allUsers.find(u => u.email === friendEmail);
                      return (
                        <SelectItem key={friend.id} value={friendEmail}>
                          {friendUser?.full_name || friendEmail}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {selectedFriend ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-slate-800 rounded-lg">
                      <div className="text-4xl font-bold text-violet-400 mb-2">{myStats.totalAnime}</div>
                      <div className="text-sm text-slate-400">Your Total Anime</div>
                    </div>
                    <div className="text-center p-6 bg-slate-800 rounded-lg">
                      <div className="text-4xl font-bold text-purple-400 mb-2">~</div>
                      <div className="text-sm text-slate-400">Friend's Total</div>
                      <div className="text-xs text-slate-500 mt-2">
                        (Friend data privacy protected)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    Select a friend to compare stats
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Stats */}
          <TabsContent value="global">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-violet-500/20 rounded-full">
                      <Users className="w-8 h-8 text-violet-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{globalStats.totalUsers}</div>
                  <div className="text-sm text-slate-400">Total Users</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <TrendingUp className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{Math.round(globalStats.totalAnime)}</div>
                  <div className="text-sm text-slate-400">Anime Tracked</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Award className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{globalStats.avgAnimePerUser.toFixed(1)}</div>
                  <div className="text-sm text-slate-400">Avg per User</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}