'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  _id: string;
  name: string;
  status: string;
}

interface Group {
  _id: string;
  name: string;
  members: User[];
}

interface Message {
  _id: string;
  senderId: { name: string };
  content: string;
  createdAt: string;
}

export default function ChatDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ type: 'user' | 'group'; id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, groupsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, { withCredentials: true })
      ]);
      setUsers(usersRes.data);
      setGroups(groupsRes.data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!, { withCredentials: true });
    socketRef.current.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        const query = selectedChat.type === 'user' ? { receiverId: selectedChat.id } : { groupId: selectedChat.id };
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
          params: query,
          withCredentials: true
        });
        setMessages(res.data);
      };
      fetchMessages();
      socketRef.current?.emit('join-room', selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const data = selectedChat.type === 'user' 
      ? { receiverId: selectedChat.id, content: newMessage }
      : { groupId: selectedChat.id, content: newMessage };
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, data, { withCredentials: true });
    socketRef.current?.emit('send-message', { ...data, senderId: user?.id });
    setNewMessage('');
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password')
    }, { withCredentials: true });
    setShowCreateUser(false);
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { withCredentials: true });
    setUsers(res.data);
  };

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
      name: formData.get('name'),
      members: []
    }, { withCredentials: true });
    setShowCreateGroup(false);
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, { withCredentials: true });
    setGroups(res.data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'dnd': return 'bg-red-500';
      case 'break': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Team Chat</h2>
          <Button onClick={logout} variant="outline" size="sm">Logout</Button>
        </div>
        {user?.role === 'admin' && (
          <div className="mb-4 space-y-2">
            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">Create User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <Input name="name" placeholder="Name" required />
                  <Input name="email" placeholder="Email" type="email" required />
                  <Input name="password" placeholder="Password" type="password" required />
                  <Button type="submit">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full">Create Group</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <Input name="name" placeholder="Group Name" required />
                  <Button type="submit">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
        <div className="mb-4">
          <h3 className="font-semibold">Users</h3>
          <ScrollArea className="h-40">
            {users.filter(u => u._id !== user?.id).map(u => (
              <div
                key={u._id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedChat({ type: 'user', id: u._id, name: u.name })}
              >
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <span>{u.name}</span>
                <Badge className={`ml-auto w-2 h-2 ${getStatusColor(u.status)}`} />
              </div>
            ))}
          </ScrollArea>
        </div>
        <div>
          <h3 className="font-semibold">Groups</h3>
          <ScrollArea className="h-40">
            {groups.map(g => (
              <div
                key={g._id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedChat({ type: 'group', id: g._id, name: g.name })}
              >
                {g.name}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">{selectedChat.name}</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {messages.map(m => (
                <div key={m._id} className="mb-2">
                  <strong>{m.senderId.name}:</strong> {m.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t flex">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 mr-2"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a user or group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}