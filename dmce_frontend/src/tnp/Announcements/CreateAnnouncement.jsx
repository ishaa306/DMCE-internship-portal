import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './CreateAnnouncement.css';
import CollegeHeader from '../../shared/CollegeHeader';
import {
  FaBold, FaItalic, FaUnderline, FaListUl, FaListOl,
  FaLink, FaImage, FaHeading, FaAlignLeft,
  FaAlignCenter, FaAlignRight
} from 'react-icons/fa';

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    const editor = editorRef.current;
    if (editor) {
      editor.focus();
      setContent(editor.innerHTML);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-Side Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim() || content === '<br>') {
      toast.error('Content is required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Publishing...');

    try {
      // 2. Prepare Headers (Try finding token, but don't fail if missing)
      const token = localStorage.getItem('tpo_token') ||
        localStorage.getItem('token');

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 3. API Call
      // FIX: URL set to /api/tnp/announcements (Correct Path)
      // FIX: credentials: 'include' (Sends the Session Cookie)
      const response = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/tpo/announcements', {
        method: 'POST',
        credentials: 'include',
        // headers: headers,
        body: JSON.stringify({
          title: title.trim(),
          content: content
        }),
      });

      // 4. Handle Response
      const contentType = response.headers.get("content-type");
      let data = {};

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Specific check for 404 to warn about URL mismatch
        if (response.status === 404) throw new Error("API Endpoint not found (404).");
        throw new Error(text || `Server Error ${response.status}`);
      }

      if (response.ok && data.success) {
        toast.success(data.message || 'Announcement Published! 🚀', { id: toastId });
        setTitle('');
        setContent('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setTimeout(() => navigate('/tpo/view-announcements'), 1000);
      } else {
        if (response.status === 401) {
          throw new Error("Session expired. Please Log Out and Log In again.");
        }
        throw new Error(data.message || "Failed to post announcement");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-announcement-container">
      <Toaster position="top-right" />
      <CollegeHeader />

      <div className="announcement-form-container">
        <h1>Create New Announcement</h1>

        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-group">
            <label htmlFor="announcement-title">Announcement Title</label>
            <input
              type="text"
              id="announcement-title"
              className="announcement-title-input"
              placeholder="Enter title (max 200 chars)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              maxLength={200}
              required
            />
          </div>

          <div className="form-group">
            <label>Announcement Content</label>
            <div className={`rich-text-toolbar ${loading ? 'disabled-toolbar' : ''}`}>
              <button type="button" onClick={() => formatText('bold')} title="Bold"><FaBold /></button>
              <button type="button" onClick={() => formatText('italic')} title="Italic"><FaItalic /></button>
              <button type="button" onClick={() => formatText('underline')} title="Underline"><FaUnderline /></button>
              <span className="toolbar-divider"></span>
              <button type="button" onClick={() => formatText('formatBlock', '<h2>')} title="Heading"><FaHeading /></button>
              <button type="button" onClick={() => formatText('insertUnorderedList')} title="Bullet List"><FaListUl /></button>
              <button type="button" onClick={() => formatText('insertOrderedList')} title="Numbered List"><FaListOl /></button>
              <span className="toolbar-divider"></span>
              <button type="button" onClick={() => formatText('justifyLeft')} title="Align Left"><FaAlignLeft /></button>
              <button type="button" onClick={() => formatText('justifyCenter')} title="Align Center"><FaAlignCenter /></button>
              <button type="button" onClick={() => formatText('justifyRight')} title="Align Right"><FaAlignRight /></button>
              <span className="toolbar-divider"></span>
              <button type="button" onClick={() => {
                const url = prompt('Enter link URL:');
                if (url) formatText('createLink', url);
              }} title="Link"><FaLink /></button>
              <button type="button" onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) formatText('insertImage', url);
              }} title="Image"><FaImage /></button>
            </div>

            <div
              ref={editorRef}
              className={`rich-text-editor ${loading ? 'editor-loading' : ''}`}
              contentEditable={!loading}
              onInput={handleContentChange}
              suppressContentEditableWarning={true}
              placeholder="Write your announcement here..."
            ></div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
            <button type="submit" className="announce-btn" disabled={loading}>
              {loading ? 'Publishing...' : 'Announce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;