import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaSignOutAlt, FaUserCircle, FaSignInAlt } from 'react-icons/fa';
import moment from 'moment';

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const blogSectionRef = useRef(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/blogs/')
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  }, []);

  const scrollToBlogs = () => {
    blogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/auth/jwt/create/', { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.access);
        setToken(res.data.access);
        alert('Login successful!');
        setShowLogin(false);
      })
      .catch(() => alert('Login failed'));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/auth/users/', { username, password })
      .then(() => handleLogin(e))
      .catch(() => alert('Signup failed'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);
    axios.post('http://127.0.0.1:8000/api/blogs/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(res => {
      setBlogs([res.data, ...blogs]);
      setTitle('');
      setContent('');
      setImage(null);
      scrollToBlogs();
    })
    .catch(err => {
      alert('Create failed');
      console.error(err);
    });
  };

  const startEdit = (blog) => {
    setEditingId(blog.id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  const saveEdit = (id) => {
    axios.put(`http://127.0.0.1:8000/api/blogs/${id}/`, {
      title: editTitle,
      content: editContent
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const updatedBlogs = blogs.map(b => b.id === id ? res.data : b);
      setBlogs(updatedBlogs);
      setEditingId(null);
    }).catch(() => alert('Edit failed'));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      axios.delete(`http://127.0.0.1:8000/api/blogs/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setBlogs(blogs.filter(b => b.id !== id));
      })
      .catch(() => alert("Delete failed"));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 font-sans">
      <nav className="bg-purple-700 shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl font-bold text-white">DreamBlogs</motion.h1>
          <div className="flex items-center space-x-4">
            {token && (
              <span className="flex items-center text-white">
                <FaUserCircle className="mr-1" /> {username}
              </span>
            )}
            {token ? (
              <motion.button whileHover={{ scale: 1.05 }} onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center">
                <FaSignOutAlt className="mr-2" /> Logout
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowLogin(!showLogin)} className="bg-white text-purple-700 px-3 py-1 rounded hover:bg-purple-100 flex items-center">
                <FaSignInAlt className="mr-2" /> Login
              </motion.button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl font-extrabold text-purple-800 mb-2">Welcome to DreamBlogs ✨</motion.h2>
        <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg text-gray-700 mb-6">Share your thoughts, stories and ideas with the world.</motion.p>
        <motion.button whileHover={{ scale: 1.1 }} onClick={scrollToBlogs} className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700">Explore Blogs</motion.button>
      </section>

      <div className="max-w-6xl mx-auto p-4">
        <AnimatePresence>{showLogin && !token && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="bg-white p-4 rounded-lg shadow-md max-w-sm mx-auto mb-8">
            <h2 className="text-lg font-bold mb-3 text-center text-purple-700">{isSignup ? 'Sign Up' : 'Login'}</h2>
            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-3">
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              <button type="submit" className="w-full bg-purple-600 text-white py-1 rounded hover:bg-purple-700">{isSignup ? 'Sign Up' : 'Login'}</button>
              <p className="text-center text-sm">
                {isSignup ? 'Already have an account?' : 'Don’t have an account?'}
                <span className="text-blue-600 ml-1 cursor-pointer underline" onClick={() => setIsSignup(!isSignup)}>{isSignup ? 'Login' : 'Signup'}</span>
              </p>
            </form>
          </motion.div>
        )}</AnimatePresence>

        {token && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
              <h2 className="text-2xl font-bold text-purple-700 mb-2">Create a Blog</h2>
              <input type="text" placeholder="Blog Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded" />
              <textarea placeholder="Write your story..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 border border-gray-300 rounded h-40"></textarea>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded" />
              <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Post Blog</button>
            </form>
          </motion.div>
        )}

        <div ref={blogSectionRef}></div>
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold text-purple-800 mb-4">📚 Latest Blogs</motion.h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <AnimatePresence>{blogs.map(blog => (
            <motion.div key={blog.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white p-5 rounded-lg shadow hover:shadow-xl transition">
              {blog.image && <img src={blog.image.startsWith('http') ? blog.image : `http://127.0.0.1:8000${blog.image}`} alt="Blog" className="w-full h-48 object-cover rounded mb-4" />}
              {editingId === blog.id ? (
                <>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 border rounded mb-2" />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-2 h-28 border rounded mb-2" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(blog.id)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-purple-700 mb-1">{blog.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap mb-2">{blog.content}</p>
                  <p className="text-sm text-gray-500 mb-2">Posted on {moment(blog.created_at).format('MMMM Do YYYY, h:mm A')}</p>
                  {token && (
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(blog)} className="text-yellow-600 flex items-center hover:underline"><FaEdit className="mr-1" /> Edit</button>
                      <button onClick={() => handleDelete(blog.id)} className="text-red-600 flex items-center hover:underline"><FaTrash className="mr-1" /> Delete</button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}</AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default App;
