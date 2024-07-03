import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import ChatPage from './components/ChatPage';
import CreatePost from './components/CreatePost';
import AddPost from './components/AddPost';
import ViewProfile from './components/ViewProfile.js';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat/:friendUsername" element={<ChatPage />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile/:username" element={<ViewProfile />} />
          <Route path="/" element={<Home />} />
          <Route path="/add-post" element={<AddPost />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
