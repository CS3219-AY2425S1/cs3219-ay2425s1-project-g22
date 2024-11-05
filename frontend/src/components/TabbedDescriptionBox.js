import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import TextareaAutosize from 'react-textarea-autosize';

function TabbedDescriptionBox({ selectedTab, setSelectedTab, text, handleChange }) {

  return (
    <div className="border rounded-md">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${selectedTab === 'write' ? 'bg-gray-200 text-gray-600 rounded-md' : 'text-gray-400 hover:text-gray-700 transition-colors duration-300'}`}
          type="button"
          onClick={() => setSelectedTab('write')}
        >
          Write
        </button>
        <button
          className={`px-4 py-2 ${selectedTab === 'preview' ? 'bg-gray-200 text-gray-600 rounded-md' : 'text-gray-400 hover:text-gray-700 transition-colors duration-300'}`}
          type="button"
          onClick={() => setSelectedTab('preview')}
        >
          Preview
        </button>
      </div>
      <div className={`${selectedTab === 'write' ? '' : ''} p-2`}>
        {selectedTab === 'write' ? (
          <div>
            <TextareaAutosize
              className="p-2 border rounded w-full"
              minRows={5}
              name="description"
              value={text}
              onChange={handleChange}
              placeholder="Describe the question in detail here in markdown syntax"
            />
          </div>
        ) : (
          <div className="w-full p-2 min-h-[9em]">
            <ReactMarkdown>{text || 'Nothing to preview'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default TabbedDescriptionBox;