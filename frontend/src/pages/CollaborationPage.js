import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import collabService from '../services/collabService';
import debounce from 'lodash.debounce';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '.././index.css';
import DisconnectAlert from '../components/DisconnectAlert';
import QuestionDisplay from '../components/QuestionDisplay';
import { languageList } from "../commons/constants";
import { initializeRoom, translateCode, handleChatMessage, handleDisconnect, handleCodeChange, handleOtherUserDisconnect } from '../controllers/collabController';

function CollaborationPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const editorRef = useRef(null); // Reference to the editor instance
  const isRemoteChange = useRef(false); // Flag to prevent infinite loop, true if change to editor is from remote (other user)
  const timeoutRef = useRef(null); // Timeout reference for the read-only state of the editor
  const countdownRef = useRef(null); // Timeout reference for the countdown when user gets kicked out
  const messagesEndRef = useRef(null); // Reference to the end of the chat messages
  const codeRef = useRef(""); // Reference to the code
  const languageRef = useRef("javascript"); // Ref for language

  // Testing Data
  const example_question = {
    questionTitle: "Fibonacci Number",
    questionCategory: ["Algorithms", "Strings"],
    questionComplexity: "easy",
    questionDescription:
      "Given an integer `n`, calculate the `nth` Fibonacci number `F(n)`. \n \n The Fibonacci sequence is defined as follows: \n- `F(0) = 0` \n- `F(1) = 1` \n- `F(n) = F(n-1) + F(n-2) for n > 1`\n ",
  };

  const [questionObject, setQuestionObject] = useState(example_question);
  const [questionId, setQuestionId] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isGettingKickedOut, setIsGettingKickedOut] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [userId, setUserId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [response, setResponse] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languageRef.current);
  const [editorLanguage, setEditorLanguage] = useState("javascript");

  // ** introduce theme variables **
  const [editorTheme, setEditorTheme] = useState(() => {
    // saved local theme or default to 'dark'
    return localStorage.getItem("editorTheme") || "dark";
  });

  // local storage
  useEffect(() => {
    localStorage.setItem("editorTheme", editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    const setters = {
      setUserId,
      setCurrentUsername,
      setQuestionObject,
      setQuestionId,
      setEditorLanguage,
      setIsReadOnly,
      setIsGettingKickedOut,
      setCountdown,
      setResponse,
    };

    collabService.onCodeChange((newCode) => {
      handleCodeChange(setters, newCode, editorRef, timeoutRef, isRemoteChange);
    });

    collabService.onChatMessage((data) => handleChatMessage(data));

    collabService.onOtherUserDisconnect(() =>
      handleOtherUserDisconnect(setters, countdownRef, navigate)
    );

    initializeRoom(setters, roomId, codeRef, navigate);

    return () => {
      collabService.offChatMessage(handleChatMessage);
    };
  }, [navigate, roomId]);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // On navigating away
  useEffect(() => {
    window.addEventListener("beforeunload", () =>
      handleDisconnect(userId, questionId, roomId, codeRef.current, languageRef.current)
    ); // For page refresh

    return async () => {
      window.removeEventListener("beforeunload", () =>
        handleDisconnect(userId, questionId, roomId, codeRef.current, languageRef.current)
      );
      handleDisconnect(userId, questionId, roomId, codeRef.current, languageRef.current); // For component unmount (navigating away)
    };
  }, [questionId, userId, roomId]);

  useEffect(() => {
    collabService.onLanguageChange((newLanguage) => {
      languageRef.current = newLanguage;
      setSelectedLanguage(newLanguage);
      setEditorLanguage(newLanguage);
    });
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const debouncedContentChangeHandler = debounce(() => {
      if (isRemoteChange.current) {
        isRemoteChange.current = false;
        return;
      }

      const changedCode = editor.getValue();
      codeRef.current = changedCode;
      collabService.sendCode(changedCode);
    }, 300);

    editor.onDidChangeModelContent(debouncedContentChangeHandler);
  };

  const editorOptions = {
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    theme: editorTheme === "dark" ? "vs-dark" : "light", // Dynamically set theme
    lineHeight: 18,
    padding: { top: 16 },
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    collabService.sendChatMessage(newMessage);
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", message: newMessage },
    ]);
    setNewMessage("");
  };

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    translateCode(
      { setSelectedLanguage, setEditorLanguage },
      codeRef,
      languageRef,
      newLanguage
    );
    collabService.sendLanguageChange(newLanguage);
  };

  // ** toggle handler **
  const toggleEditorTheme = () => {
    setEditorTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="h-[calc(100vh-65px)] w-full flex flex-col">
      {/* ** DaisyUI toggle within the editor ** */}
      <div className="flex flex-row flex-grow h-2/3">
        <div className="w-1/2 bg-[#1e1e1e] flex text-white overflow-y-auto px-3 border-r-2 border-black">
          <QuestionDisplay
            language={selectedLanguage}
            question={questionObject}
          />
        </div>

        <div className="w-1/2 h-full flex relative bg-[#1e1e1e]">
          {isReadOnly && (
            <div>
              <div className="absolute inset-0 bg-gray-700 opacity-75 flex justify-center items-center z-10">
                <span className="text-white font-semibold">
                  Other user is typing...
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col w-full">
            {/* ** theme toggle code ** */}
            <div className="flex justify-end p-2">
              <label
                className="swap swap-rotate"
                aria-label="Toggle Editor Theme"
              >
                <input
                  type="checkbox"
                  checked={editorTheme === "dark"}
                  onChange={toggleEditorTheme}
                />

                {/* Sun Icon (Visible when in Dark Mode) */}
                <svg
                  className="swap-on fill-current w-6 h-6 text-yellow-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5a1 1 0 011 1V7a1 1 0 11-2 0V5.5a1 1 0 011-1zm0 13a1 1 0 011 1V19a1 1 0 11-2 0v-1.5a1 1 0 011-1zm8-8a1 1 0 011 1H19a1 1 0 110-2h2a1 1 0 011 1zm-15 0a1 1 0 011 1H5a1 1 0 110-2H4a1 1 0 011 1zm12.364-5.364a1 1 0 011.414 0l1.061 1.061a1 1 0 11-1.414 1.414L16.364 6.05a1 1 0 010-1.414zm-12.728 12.728a1 1 0 011.414 0l1.061 1.061a1 1 0 11-1.414 1.414L3.636 18.364a1 1 0 010-1.414zm12.728 0a1 1 0 010 1.414l-1.061 1.061a1 1 0 11-1.414-1.414l1.061-1.061a1 1 0 011.414 0zm-12.728-12.728a1 1 0 010 1.414L4.05 6.05a1 1 0 11-1.414-1.414l1.061-1.061a1 1 0 011.414 0zM12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>

                {/* Moon Icon (Visible when in Light Mode) */}
                <svg
                  className="swap-off fill-current w-6 h-6 text-white-800"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M21.752 15.002A9 9 0 1111.002 2a7 7 0 109.75 13.002z" />
                </svg>
              </label>
            </div>

            <div className="pb-2">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="text-gray-800 font-medium text-xs bg-gray-200 border rounded-md p-2 mt-8 mx-4"
              >
                {languageList.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <Editor
              className="h-full text-sm"
              language={editorLanguage}
              value={codeRef.current}
              onChange={(newCode) => (codeRef.current = newCode)}
              theme={editorTheme === "dark" ? "vs-dark" : "light"} // Dynamically set theme
              options={editorOptions}
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      </div>

      {/* Chatbox at the bottom */}
      <div className="h-1/3 w-full border-t border-gray-700 flex flex-col bg-gray-800">
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-3">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col mb-2 ${
                msg.sender === "You" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`text-sm font-semibold text-white ${
                  msg.sender === "You" ? "text-right" : "text-left"
                }`}
              >
                {msg.sender}
              </div>
              <div
                className={`max-w-md p-2 rounded-lg break-words ${
                  msg.sender === "You"
                    ? "bg-blue-600 text-white text-right"
                    : "bg-gray-700 text-white"
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
                if (e.key === "Enter") {
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
          <DisconnectAlert
            text={`Other user disconnected! Saving changes and redirecting in ${countdown}s...`}
          />
        </div>
      )}
    </div>
  );
}

export default CollaborationPage;

