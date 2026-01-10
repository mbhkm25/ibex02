import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'business';
  time: string;
  date?: string;
}

export function CustomerChat() {
  const navigate = useNavigate();
  const { businessId, customerId } = useParams();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TODO: Fetch customer data from API
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch customer data from API
    setLoading(false);
    setCustomer(null);
  }, [customerId, businessId]);

  // TODO: Fetch messages from API
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    // TODO: Fetch messages from API
    setMessages([]);
  }, [customerId, businessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'business',
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/business/${businessId}/manage`)}
            className="h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10 border-2 border-gray-200">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-black">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-gray-900 truncate">{customer.name}</h1>
            <p className="text-xs text-gray-500">متصل الآن</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const showDate = index === 0 || msg.date || 
            (index > 0 && messages[index - 1].date !== msg.date);
          const isBusiness = msg.sender === 'business';

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {msg.date || 'اليوم'}
                  </span>
                </div>
              )}
              <div className={`flex items-end gap-2 ${isBusiness ? 'justify-end' : 'justify-start'}`}>
                {!isBusiness && (
                  <Avatar className="w-8 h-8 border border-gray-200 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] font-black">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${isBusiness ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2.5 ${
                    isBusiness
                      ? 'bg-gray-900 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className={`text-[10px] text-gray-500 mt-1 px-1 ${isBusiness ? 'text-left' : 'text-right'}`}>
                    {msg.time}
                  </div>
                </div>
                {isBusiness && (
                  <Avatar className="w-8 h-8 border border-gray-200 shrink-0 order-2">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[10px] font-black">
                      🏪
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالة..."
              className="pr-12 h-12 rounded-2xl border-2 border-gray-200 text-sm focus:border-blue-400 resize-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl"
            >
              <Smile className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-12 w-12 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white shrink-0 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

