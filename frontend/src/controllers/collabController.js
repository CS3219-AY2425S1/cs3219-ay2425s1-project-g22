// collaborationController.js
import collabService from '../services/collabService';
import { translateCodeService } from '../services/aiService';
import { addAttemptedQuestion, getToken, verifyToken } from '../services/userService';
import { extractCode } from '../commons/utils';

export const initializeRoom = async (setters, roomId, codeRef, navigate) => {
  const token = getToken();

  try {
    const data = await verifyToken(token);
    const { id: userId, username } = data.data;

    setters.setUserId(userId);
    setters.setCurrentUsername(username);

    if (!roomId) {
      const fetchedRoomId = await fetchRoomIdWithRetry(username);
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
    setters.setQuestionObject(room.question);
    setters.setQuestionId(room.question.questionId);
    setters.setLanguage(room.language);
    setters.setEditorLanguage(room.language);

    codeRef.current = room.code;
  } catch (error) {
    console.error("Error initializing room:", error);
    navigate('/');
  }
};

export function handleCodeChange(setters, newCode, editorRef, timeoutRef, isRemoteChange) {
  if (editorRef.current) {
    isRemoteChange.current = true;
    setters.setIsReadOnly(true);
    editorRef.current.updateOptions({ readOnly: true });

    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
      setters.setIsReadOnly(false);
      editorRef.current.updateOptions({ readOnly: false });
    }, 1000);

    const cursorPosition = editorRef.current.getPosition();
    editorRef.current.setValue(newCode);
    editorRef.current.setPosition(cursorPosition);
  }
}

export const handleOtherUserDisconnect = (setters, countdownRef, navigate) => {
  setters.setIsGettingKickedOut(true);
  setters.setCountdown(10);

  if (countdownRef.current) {
    clearInterval(countdownRef.current);
  }

  // Start countdown timer
  countdownRef.current = setInterval(() => {
    setters.setCountdown((prevCount) => {
      if (prevCount === 1) {
        clearInterval(countdownRef.current);
        navigate("/"); // Redirect when countdown reaches zero
      }
      return prevCount - 1;
    });
  }, 1000);
  return () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  };
}

export const handleChatMessage = (setters, data) => {
  setters.setChatMessages((prevMessages) => [
    ...prevMessages,
    { sender: data.sender, message: data.message },
  ]);
};

export const handleDisconnect = async (userId, questionId, roomId, code, language) => {
  if (userId && questionId) {
    collabService.disconnect();
    console.log("Adding attempted question:", questionId);
    await addAttemptedQuestion(userId, questionId, roomId, code, language);
  }
}

export async function translateCode(setters, codeRef, sourceLang, targetLang) {
  const translatedCode = await translateCodeService(codeRef.current, sourceLang, targetLang);
  const formattedTranslation = extractCode(translatedCode);
  codeRef.current = formattedTranslation;
  setters.setSelectedLanguage(targetLang);
  setters.setEditorLanguage(targetLang);
}

async function fetchRoomIdWithRetry(username, maxRetries = 5, delayMs = 1000) {
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