import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Users, TrendingUp, Send, UserPlus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import moment from "moment";

export default function Community() {
  const [message, setMessage] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [selectedChat, setSelectedChat] = useState("global");
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedChat],
    queryFn: () => {
      if (selectedChat === "global") {
        return base44.entities.Message.filter({ recipient_email: "global" }, "-created_date", 100);
      } else {
        return base44.entities.Message.list("-created_date", 100);
      }
    },
    refetchInterval: 3000,
  });

  // Fetch friendships
  const { data: friendships = [] } = useQuery({
    queryKey: ["friendships"],
    queryFn: () => base44.entities.Friendship.list(),
  });

  // Fetch all users
  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setMessage("");
    },
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: (email) => base44.entities.Friendship.create({ friend_email: email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      setFriendEmail("");
    },
  });

  // Accept friend mutation
  const acceptFriendMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.update(id, { status: "accepted" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });

  // Reject friend mutation
  const rejectFriendMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({
      text: message,
      recipient_email: selectedChat,
    });
  };

  const handleAddFriend = () => {
    if (!friendEmail.trim()) return;
    addFriendMutation.mutate(friendEmail);
  };

  const myFriends = friendships.filter(f => f.status === "accepted");
  const pendingRequests = friendships.filter(f => f.status === "pending" && f.friend_email === currentUser?.email);
  const sentRequests = friendships.filter(f => f.status === "pending" && f.created_by === currentUser?.email);

  const filteredMessages = selectedChat === "global" 
    ? messages.filter(m => m.recipient_email === "global")
    : messages.filter(m => 
        (m.created_by === currentUser?.email && m.recipient_email === selectedChat) ||
        (m.recipient_email === currentUser?.email && m.created_by === selectedChat)
      );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-slate-400">Connect with fellow anime fans</p>
        </motion.div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 mb-6">
            <TabsTrigger value="chat" className="data-[state=active]:bg-violet-500/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-violet-500/20">
              <Users className="w-4 h-4 mr-2" />
              Friends
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-violet-500">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-violet-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Chat List */}
              <Card className="lg:col-span-1 bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm">Chats</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <button
                      onClick={() => setSelectedChat("global")}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors ${
                        selectedChat === "global" ? "bg-violet-500/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">Global Chat</div>
                          <div className="text-xs text-slate-400">Everyone</div>
                        </div>
                      </div>
                    </button>
                    {myFriends.map((friend) => {
                      const friendUser = allUsers.find(u => u.email === friend.friend_email || u.email === friend.created_by && u.email !== currentUser?.email);
                      const chatEmail = friend.friend_email === currentUser?.email ? friend.created_by : friend.friend_email;
                      return (
                        <button
                          key={friend.id}
                          onClick={() => setSelectedChat(chatEmail)}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors ${
                            selectedChat === chatEmail ? "bg-violet-500/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-sm font-bold">{friendUser?.full_name?.[0] || "?"}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{friendUser?.full_name || chatEmail}</div>
                              <div className="text-xs text-slate-400">{chatEmail}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="lg:col-span-3 bg-slate-900 border-slate-700">
                <CardHeader className="border-b border-slate-700">
                  <CardTitle className="text-lg">
                    {selectedChat === "global" ? "Global Chat" : selectedChat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {filteredMessages.map((msg) => {
                        const isOwn = msg.created_by === currentUser?.email;
                        const sender = allUsers.find(u => u.email === msg.created_by);
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                              {!isOwn && (
                                <div className="text-xs text-slate-400 mb-1 px-3">
                                  {sender?.full_name || msg.created_by}
                                </div>
                              )}
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? "bg-violet-600 text-white rounded-br-sm"
                                    : "bg-slate-800 text-slate-100 rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <div className="text-xs text-slate-500 mt-1 px-3">
                                {moment(msg.created_date).fromNow()}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message..."
                        className="bg-slate-800 border-slate-700"
                      />
                      <Button onClick={handleSendMessage} className="bg-violet-600 hover:bg-violet-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Friend */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle>Add Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      placeholder="friend@email.com"
                      className="bg-slate-800 border-slate-700"
                    />
                    <Button onClick={handleAddFriend} className="bg-violet-600 hover:bg-violet-700">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <CardTitle>Friend Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pendingRequests.map((req) => {
                        const requester = allUsers.find(u => u.email === req.created_by);
                        return (
                          <div key={req.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                            <div>
                              <div className="font-semibold text-sm">{requester?.full_name || req.created_by}</div>
                              <div className="text-xs text-slate-400">{req.created_by}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => acceptFriendMutation.mutate(req.id)}
                                className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectFriendMutation.mutate(req.id)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Friends List */}
            <Card className="bg-slate-900 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle>My Friends ({myFriends.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {myFriends.map((friend) => {
                    const friendUser = allUsers.find(u => u.email === friend.friend_email || u.email === friend.created_by && u.email !== currentUser?.email);
                    const friendEmail = friend.friend_email === currentUser?.email ? friend.created_by : friend.friend_email;
                    return (
                      <Card key={friend.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <span className="text-lg font-bold text-white">
                                {friendUser?.full_name?.[0] || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold">{friendUser?.full_name || friendEmail}</div>
                              <div className="text-xs text-slate-400">{friendEmail}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myFriends.slice(0, 10).map((friend) => {
                    const friendUser = allUsers.find(u => u.email === friend.friend_email || u.email === friend.created_by && u.email !== currentUser?.email);
                    const friendEmail = friend.friend_email === currentUser?.email ? friend.created_by : friend.friend_email;
                    return (
                      <div key={friend.id} className="flex items-start gap-3 pb-4 border-b border-slate-700 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold">{friendUser?.full_name?.[0] || "?"}</span>
                        </div>
                        <div>
                          <div className="text-sm">
                            <span className="font-semibold">{friendUser?.full_name || friendEmail}</span>
                            {" "}became friends with you
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {moment(friend.created_date).fromNow()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}