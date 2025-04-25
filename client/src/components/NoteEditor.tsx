import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import debounce from 'lodash/debounce';

interface Note {
  _id: string;
  title: string;
  content: string;
  lastModified: string;
}

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id !== 'new') {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await axios.get(`/api/notes/${id}`);
      setNote(response.data);
      setTitle(response.data.title);
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('Failed to load note');
    }
  };

  const saveNote = async (title: string, content: string) => {
    try {
      setSaving(true);
      if (id === 'new') {
        const response = await axios.post('/api/notes', { title, content });
        navigate(`/notes/${response.data._id}`);
      } else {
        await axios.put(`/api/notes/${id}`, { title, content });
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Failed to save note');
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((title: string, content: string) => {
      saveNote(title, content);
    }, 1000),
    [id]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    debouncedSave(title, value);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/notes/${id}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting note:', error);
      setError('Failed to export note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {saving && <span className="text-gray-500">Saving...</span>}
              {id !== 'new' && (
                <button
                  onClick={handleExport}
                  className="text-primary-600 hover:text-primary-900"
                >
                  Export PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title"
            className="w-full px-4 py-2 mb-4 text-2xl font-bold border-0 focus:ring-0"
          />
          <ReactQuill
            value={content}
            onChange={handleContentChange}
            className="bg-white"
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default NoteEditor; 