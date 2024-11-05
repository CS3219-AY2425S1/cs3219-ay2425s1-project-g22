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
  const { roomId } = useParams()

  const editorRef = useRef(null); // Reference to the editor instance
  const isRemoteChange = useRef(false); // Flag to prevent infinite loop, true if change to editor is from remote (other user)
  const timeoutRef = useRef(null); // Timeout reference for the read-only state of the editor
  const countdownRef = useRef(null); // Timeout reference for the countdown when user gets kicked out
  
  const [code, setCode] = useState('');
  const [question, setQuestion] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isGettingKickedOut, setIsGettingKickedOut] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [userId, setUserId] = useState('');

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

        console.log("Username:", username);
  
        // If route is /room, redirect to room that user belongs to
        if (!roomId) {
          console.log("No room ID provided; fetching room ID...");
          const fetchedRoomId = await fetchRoomIdWithRetry(username);
          console.log("Fetched room ID:", fetchedRoomId);
          navigate(`/room/${fetchedRoomId}`);
          return;
        }
        

  
        const room = await collabService.getRoomDetails(roomId);
        const users = room.users;
  
        // Check if the user is part of the room; if not, redirect
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
        setIsReadOnly(true); // Set read-only and display overlay

        editorRef.current.updateOptions({
          readOnly: true,
        });

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsReadOnly(false); // Remove read-only and hide overlay
          editorRef.current.updateOptions({
            readOnly: false,
          });
        }, 1000);

        const cursorPosition = editorRef.current.getPosition();
        editorRef.current.setValue(newCode);
        editorRef.current.setPosition(cursorPosition);
      }
    });
  }, []);

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
    return async () => {
      if (userId && questionId) {
        collabService.disconnect();
        console.log("Adding attempted question:", questionId);
        await addAttemptedQuestion(userId, questionId);
      }
    };
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
    }, 300); // 300ms debounce time
  
    editor.onDidChangeModelContent(debouncedContentChangeHandler);
  };

  const editorOptions = {
    fontSize: 16,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    theme: "vs-dark",
  };

  return (
    <div className="h-[calc(100vh-65px)] w-full flex flex-row justify-center items-center">
      <div className="w-1/2 bg-[#1e1e1e] flex text-white h-full overflow-y-auto px-3 border-r-2 border-black">
        <ReactMarkdown className="text-lg leading-tight whitespace-pre-wrap markdown">
          {question}
        </ReactMarkdown>
      </div>

      <div className="w-1/2 h-full flex relative">
        {/* Overlay that appears when editor is read-only */}
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

      {isGettingKickedOut && (
        <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 z-50">
          <DisconnectAlert text={`Other user disconnected! Redirecting to home page in ${countdown}s...`}/>
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
