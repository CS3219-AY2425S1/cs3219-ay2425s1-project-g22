import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import collabService from '../services/collabService';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash.debounce';
import { useParams } from 'react-router-dom';
import { getToken, verifyToken } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { addAttemptedQuestion } from '../services/userService';
import '.././index.css';
import DisconnectAlert from '../components/DisconnectAlert';

function CollaborationPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const editorRef = useRef(null); // Reference to the editor instance
  const isRemoteChange = useRef(false); // Flag to prevent infinite loop, true if change to editor is from remote (other user)
  const timeoutRef = useRef(null); // Timeout reference for the read-only state of the editor
  const countdownRef = useRef(null); // Timeout reference for the countdown when user gets kicked out
  const messagesEndRef = useRef(null); // Reference to the end of the chat messages

  const [code, setCode] = useState('');
  const [question, setQuestion] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isGettingKickedOut, setIsGettingKickedOut] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [userId, setUserId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  function formatQuestion(question) {
    return `
### **${question.questionTitle}**

**Topic**: ${question.questionCategory}  
**Complexity**: ${question.questionComplexity}  

**Question Description**  
${question.questionDescription}
    `.trim();
  }

  useEffect(() => {
    const initializeRoom = async () => {
      const token = getToken();

      try {
        const data = await verifyToken(token);
        const username = data.data.username;
        setUserId(data.data.id);
        setCurrentUsername(username);

        console.log("Username:", username);

        if (!roomId) {
          console.log("No room ID provided; fetching room ID...");
          const fetchedRoomId = await fetchRoomIdWithRetry(username);
          console.log("Fetched room ID:", fetchedRoomId);
          navigate(`/room/${fetchedRoomId}`);
          return;
        }

        const room = await collabService.getRoomDetails(roomId);
        const users = room.users;

        if (!users.includes(username)) {
          navigate('/');
          return;
        }

        await collabService.register(username);

        setQuestion(formatQuestion(room.question));
        setQuestionId(room.question.questionId);
        setCode(room.code);
        setLanguage(room.language);
      } catch (error) {
        console.error("Error initializing room:", error);
        navigate('/');
      }
    };

    initializeRoom();
  }, [navigate, roomId]);

  useEffect(() => {
    // Listen for code changes from the matched user
    collabService.onCodeChange((newCode) => {
      if (editorRef.current) {
        isRemoteChange.current = true;
        setIsReadOnly(true);

        editorRef.current.updateOptions({
          readOnly: true,
        });

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsReadOnly(false);
          editorRef.current.updateOptions({
            readOnly: false,
          });
        }, 1000);

        const cursorPosition = editorRef.current.getPosition();
        editorRef.current.setValue(newCode);
        editorRef.current.setPosition(cursorPosition);
      }
    });

    // Listen for chat messages
    const handleChatMessage = (data) => {
      setChatMessages((prevMessages) => [...prevMessages, { sender: data.sender, message: data.message }]);
    };

    collabService.onChatMessage(handleChatMessage);

    return () => {
      collabService.offChatMessage(handleChatMessage);
    };
  }, []);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Kick user out if other user disconnects
  useEffect(() => {
    collabService.onOtherUserDisconnect(() => {
      setIsGettingKickedOut(true);
      setCountdown(10);

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      // Start countdown timer
      countdownRef.current = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount === 1) {
            clearInterval(countdownRef.current);
            navigate('/'); // Redirect when countdown reaches zero
          }
          return prevCount - 1;
        });
      }, 1000);
      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };

    });
  }, [navigate]);

  // On navigating away
  useEffect(() => {
    const handleDisconnect = async () => {
      if (userId && questionId) {
        collabService.disconnect();
        console.log("Adding attempted question:", questionId);
        await addAttemptedQuestion(userId, questionId);
      }
    }

    window.addEventListener('beforeunload', handleDisconnect); // For page refresh

    return async () => {
      window.removeEventListener('beforeunload', handleDisconnect);
      handleDisconnect(); // For component unmount (navigating away)
    }
  }, [questionId, userId]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const debouncedContentChangeHandler = debounce(() => {
      if (isRemoteChange.current) {
        isRemoteChange.current = false;
        return;
      }

      const changedCode = editor.getValue();
      setCode(changedCode);
      collabService.sendCode(changedCode);
    }, 300);

    editor.onDidChangeModelContent(debouncedContentChangeHandler);
  };

  const editorOptions = {
    fontSize: 16,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    theme: "vs-dark",
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    collabService.sendChatMessage(newMessage);
    setChatMessages((prevMessages) => [...prevMessages, { sender: 'You', message: newMessage }]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-65px)] w-full flex flex-col">
      <div className="flex flex-row flex-grow">
        <div className="w-1/2 bg-[#1e1e1e] flex text-white h-full overflow-y-auto px-3 border-r-2 border-black">
          <ReactMarkdown className="text-lg leading-tight whitespace-pre-wrap markdown">
            {question}
          </ReactMarkdown>
        </div>

        <div className="w-1/2 h-full flex relative">
          {isReadOnly && (
            <div className="absolute inset-0 bg-gray-700 opacity-75 flex justify-center items-center z-10">
              <span className="text-white font-semibold">Other user is typing...</span>
            </div>
          )}

          <Editor
            language={language}
            value={code}
            onChange={(newCode) => setCode(newCode)}
            theme="vs-dark"
            options={editorOptions}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>

      {/* Chatbox at the bottom */}
      <div className="h-1/4 w-full border-t border-gray-700 flex flex-col bg-gray-800">
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-3">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex flex-col mb-2 ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div className={`text-sm font-semibold text-white ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                {msg.sender}
              </div>
              <div
                className={`max-w-md p-2 rounded-lg break-words ${msg.sender === 'You' ? 'bg-blue-600 text-white text-right' : 'bg-gray-700 text-white'
                  }`}
              >
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 border-t border-gray-700">
          <div className="flex">
            <input
              type="text"
              className="input input-bordered w-full bg-white text-black rounded-l-full rounded-r-full"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <button
              className="btn btn-primary ml-2 rounded-l-full rounded-r-full"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {isGettingKickedOut && (
        <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 z-50">
          <DisconnectAlert text={`Other user disconnected! Redirecting to home page in ${countdown}s...`} />
        </div>
      )}
    </div>
  );
}

async function fetchRoomIdWithRetry(username, maxRetries = 3, delayMs = 500) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // Try to fetch the room ID
      const fetchedRoomId = await collabService.getRoomId(username);
      return fetchedRoomId; // Exit function if successful
    } catch (error) {
      attempt++;
      console.log(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt >= maxRetries) {
        throw new Error(`Failed to fetch room ID after ${maxRetries} attempts`);
      }

      // Optionally add a delay before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

export default CollaborationPage;
