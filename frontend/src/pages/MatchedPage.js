import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';

const baseAvatarUrl = "https://avatar.iran.liara.run/public";

const generateRandomId = () => Math.floor(Math.random() * 1000);

function MatchedPage({ matchResult }) {

  const { userId, matchedUserId, topic, difficulty, language } = matchResult;
  
  const [userAcceptance, setUserAcceptance] = useState(null);
  const [matchedUserAcceptance, setMatchedUserAcceptance] = useState(null);
  const [showRejection, setShowRejection] = useState(false);
  
  const navigate = useNavigate();
  const avatarMatchUrl = `${baseAvatarUrl}?id=${generateRandomId()}`;

  useEffect(() => {
    // Listen for acceptance status from the matched user
    socketService.onAcceptanceUpdate((statusUpdate) => {
      console.log("Acceptance status update received:", statusUpdate);
      console.log("statusUpdate.userId: ", statusUpdate.userId);
      console.log("statusUpdate.isAccepted: ", statusUpdate.isAccepted);
      
      console.log("matchedUserId: ", matchedUserId);
      if (statusUpdate.userId === matchedUserId) {
        setMatchedUserAcceptance(statusUpdate.isAccepted);
        console.log("statusUpdate.userId == matchedUser");
      }
  });

  }, [matchedUserId]);

  useEffect(() => {
    console.log("matchedUserAcceptance: ", matchedUserAcceptance);
    console.log("userAcceptance: ", userAcceptance);
    // When both users have accepted the match, send the collab room data
    if (matchedUserAcceptance && userAcceptance) {
      console.log("Both users have accepted the match");
      sendCollabRoomData();
    }
  
    if (matchedUserAcceptance === false) {
      console.log("Matched user rejected the match");
      setShowRejection(true);
  
      setTimeout(() => {
        setShowRejection(false);
        navigate('/matching');
      }, 3000);
    }
  }, [matchedUserAcceptance, userAcceptance, navigate]);

  // useEffect(() => {
  //   socketService.onCollabRoom((data) => {
  //     console.log("Received 'open-collab-room' event:", data);
  //     // Navigate to the collaboration room or update the UI as needed
  //     navigate('/room');
  //   });
  // }, [navigate]);

  const handleAccept = () => {
    console.log("Accepting match");
    setUserAcceptance(true);
    socketService.sendAcceptanceStatus({ userId, isAccepted: true, matchedUserId });

    if (matchedUserAcceptance) {
      sendCollabRoomData();
    }
  };

  const sendCollabRoomData = () => {
    const collabRoomData = {
      userId1: userId,
      userId2: matchedUserId,
      interestTopic: topic,
      difficulty: difficulty,
      language: language,
    }
    socketService.sendToCollabRoom(collabRoomData);
    navigate('/room');
  };

  const handleRematch = () => {
    setUserAcceptance(false);
    socketService.sendAcceptanceStatus({ userId, isAccepted: false, matchedUserId });
    // socketService.sendRematchNotification({ userId, matchedUserId });
    // socketService.notifyMatchedUserRematch({ userId, matchedUserId });
    navigate('/matching');
  };

  const handleDismiss = () => {
    // Optionally, you can add a delay before setting showRejection to false
    setTimeout(() => {
      setShowRejection(false);
    }, 300); // Adjust the delay as needed (300ms for example)
  };
  
  return (
    <div className="h-[calc(100vh-65px)] w-full bg-[#1a1a1a] flex flex-col justify-start items-center">
      <div className="h-24 w-160">
        {showRejection && (
            <div class="w-full">
              <div id="toast-warning" class="flex items-center w-full max-w-lg p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                    <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                    </svg>
                    <span class="sr-only">Warning icon</span>
                </div>
                <div class="ms-3 text-sm font-normal">Hi, your matched user rejected this match. You will be rematched in 3 seconds.</div>
                <button 
                  type="button" 
                  class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" 
                  data-dismiss-target="#toast-warning" 
                  aria-label="Close"
                  onClick={handleDismiss}>
                    <span class="sr-only">Close</span>
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
              </div>
            </div>
          )}
      </div>

      <main className="flex-grow flex flex-col items-center justify-center gap-4">
        <div className="flex flex-row self-stretch text-center text-white text-2xl font-bold leading-tight gap-5">
          <p> Category: {topic} </p>
          <p> Difficulty: {difficulty} </p>
          <p> Language: {language} </p>
        </div>

        <div className='flex flex-row w-full items-center justify-center'>
          <div className='flex flex-col items-center justify-center gap-3'>
            <img className="w-40 h-40" src={baseAvatarUrl} alt="static avatar" />
            <div className='text-white text-xl'>
              {userId}
            </div>
            <div className={`w-4 h-4 rounded-full ${ userAcceptance === null ? 'bg-gray-500' : userAcceptance ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div className="w-36 border-black"></div>
          <div className='flex flex-col items-center justify-center gap-3'>
            <img className="w-40 h-40" src={avatarMatchUrl} alt="avatar match" />
            <div className='text-white text-xl'>
              {matchedUserId}
            </div>
            <div className={`w-4 h-4 rounded-full ${ matchedUserAcceptance === null ? 'bg-gray-500' : matchedUserAcceptance ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between mt-4">
          <button className="btn btn-secondary" onClick={handleRematch}>
            Rematch
          </button>
      
          <button className="btn btn-primary" onClick={handleAccept}>
            Start now!
          </button>
        </div>
      </main>
    </div>
  );
}

export default MatchedPage;
