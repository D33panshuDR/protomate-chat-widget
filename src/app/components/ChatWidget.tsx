"use client"
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiLoaderAlt } from "react-icons/bi";
import { AiOutlineSend, AiOutlineMessage } from "react-icons/ai";
import { IoChevronDownOutline } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import { generate } from '../chat';
 
import { readStreamableValue } from 'ai/rsc';



interface Message {
  sender: "user" | "bot";
  text: string;
}

type ChatBoxProps = {
  apiKey: string;
  botName: string;
};





const ProtomateChatWidget: React.FC<ChatBoxProps> = ({ botName }) => {
  const [showChatbox, setShowChatbox] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInput.trim() !== "") {
      setLoading(true);
      setMessages((messages) => [
        ...messages,
        {
          sender: "user",
          text: userInput,
        },
      ]);
      setUserInput("");
      const { reponse } = await generate(userInput);

        setMessages((messages) => [
            ...messages,
            {
              sender: "bot",
              text: ``,
            },
          ]);
    
          for await (const word of readStreamableValue(reponse)) { {
            

            setMessages((messages) => {
                const lastMessage = messages[messages.length -1];
                const updatedMessage = {
                    ...lastMessage,
                    text : lastMessage.text + word
                };
                return [...messages.slice(0, -1), updatedMessage];
            })            
          }
        setLoading(false);
      };
    }
  };

  const toggleChatbox = () => {
    setShowChatbox(!showChatbox);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat_widget">
      <AnimatePresence>
        {!showChatbox && (
          <motion.button
            layout
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", delay: 0.75 }}
            onClick={toggleChatbox}
            className="bg-violet-700 text-white rounded-full p-3 bg-opacity-80 backdrop-blur-sm"
          >
            <AiOutlineMessage size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChatbox && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 30 }}
            transition={{ type: "spring", bounce: 0.25 }}
            className="bg-white bg-opacity-30 backdrop-blur-md rounded-lg shadow-lg w-[30vw]"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-white bg-opacity-60 text-white rounded-t-md shadow-sm">
              <h2 className="text-xl font-bold text-violet-600">{botName}</h2>
              <button
                onClick={toggleChatbox}
                className="text-violet-800 p-1 hover:bg-black hover:bg-opacity-5 hover:text-gray-600 rounded transition-colors duration-300"
              >
                <IoChevronDownOutline size={18} />
              </button>
            </div>
            <div className="msg_box">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: message.sender === "user" ? "100%" : "-100%",
                  }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={`py-3 px-4 bg-opacity-70 rounded shadow-sm ${
                    message.sender === "user"
                      ? "bg-violet-700 text-gray-100 self-end rounded-tr-none max-w-[80%]"
                      : "bg-gray-300 text-gray-700 self-start rounded-tl-none max-w-[90%]"
                  } mb-2`}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage}>
              <div className="relative p-2 bg-white bg-opacity-20 rounded-b">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleUserInput}
                    placeholder="Type your message..."
                    className="flex-1 pl-1 pr-2 px-3 rounded-l bg-transparent text-gray-700 font-sans focus:outline-none placeholder:text-gray-600"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn__send"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {loading ? (
                      <BiLoaderAlt size={24} className="animate-spin" />
                    ) : (
                      <AiOutlineSend size={24} />
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProtomateChatWidget;
