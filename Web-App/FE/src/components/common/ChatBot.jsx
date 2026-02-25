import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus } from 'react-icons/fa';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Tôi là trợ lý ảo Smart Jewelry. Tôi có thể giúp gì cho bạn?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
        setInput("");
        setIsLoading(true);

        try {
            const apiRes = await axios.post('/api/chatbot/ask', { question: userMessage });
            setMessages(prev => [...prev, { text: apiRes.data.answer, isBot: true }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, tôi đang gặp lỗi kết nối. Vui lòng thử lại sau.", isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-luxury-brown text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
                >
                    <FaRobot className="text-2xl" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
                    {/* Header */}
                    <div className="bg-luxury-brown p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <FaRobot />
                            <span className="font-serif font-bold">Smart Jewelry Assistant</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsOpen(false)}><FaMinus size={14} /></button>
                            <button onClick={() => setIsOpen(false)}><FaTimes size={16} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-ivory/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.isBot
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'bg-luxury-brown text-white shadow-md'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl shadow-sm text-gray-400 text-xs italic animate-pulse">
                                    Đang suy nghĩ...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-white flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Nhập câu hỏi..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-luxury-brown"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-luxury-brown text-white p-2 rounded-full hover:bg-luxury-taupe transition-colors disabled:opacity-50"
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
