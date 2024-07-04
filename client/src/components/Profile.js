// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Link, useNavigate } from 'react-router-dom';
const Profile = () => {
  const [user, setUser] = useState({});
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [unreadMessageCounts, setUnreadMessageCounts] = useState({});
  const [likes, setLikes] = useState({});
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://soci-api1.onrender.com/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);
 useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get('https://soci-api1.onrender.com/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        // Convert binary image data to Base64
        const postsWithImages = response.data.map(post => {
          if (post.image && post.image.data) {
            const base64String = btoa(
              new Uint8Array(post.image.data.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
              )
            );
            return { ...post, imageBase64: `data:${post.image.contentType};base64,${base64String}` };
          } else {
            console.warn(`Post ${post._id} does not have valid image data`);
            return { ...post, imageBase64: null };
          }
        });
 
        setPosts(postsWithImages);
      } catch (error) {
        if (error.response) {
          console.error('Error fetching posts:', error.response.data);
        } else if (error.request) {
          console.error('Error fetching posts: No response received');
        } else {
          console.error('Error fetching posts:', error.message);
        }
      }
    };

    fetchPosts();
  }, []);


  useEffect(() => {
    const fetchFriends = async () => {
      if (user.username) {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`https://soci-api1.onrender.com/api/users/${user.username}/friends`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFriends(res.data);
        } catch (error) {
          console.error('Error fetching friends list:', error);
        }
      }
    };

    fetchFriends();
  }, [user.username]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://soci-api1.onrender.com/api/users/friend-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFriendRequests(res.data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriendRequests();
  }, []);

  useEffect(() => {
    // Function to fetch unread message counts for each friend
    const fetchUnreadMessageCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://soci-api1.onrender.com/api/messages/unread-counts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('kk',response.data)
        setUnreadMessageCounts(response.data);
      } catch (error) {
        console.error('Error fetching unread message counts:', error);
      }
    };

    fetchUnreadMessageCounts();
  }, []);

  
  const handleChatClick = async (friendUsername) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://soci-api1.onrender.com/api/messages/mark-seen/${friendUsername}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnreadMessageCounts((prevCounts) => ({
        ...prevCounts,
        [friendUsername]: 0,
      }));
      navigate(`/chat/${friendUsername}`, { state: { friendUsername } });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  };
    const fetchLikes = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      console.log(postId);
      const response = await axios.get(`https://soci-api1.onrender.com/api/posts/${postId}/like`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLikes((prevLikes) => ({
        ...prevLikes,
        [postId]: response.data,
      }));
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };
  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://soci-api1.onrender.com/api/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh likes after liking
      fetchLikes(postId);
      // Update the number of likes in the post object
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: [...post.likes, token] } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get( `https://soci-api1.onrender.com/api/users/search?query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResults(res.data);
    } catch (error) {
      console.error('Error searching for friends:', error);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://soci-api1.onrender.com/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };


  const handleSendFriendRequest = async (friendUsername) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://soci-api1.onrender.com/api/users/${friendUsername}/friend-request`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Friend request sent');
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `https://soci-api1.onrender.com/api/users/friend-requests/${requestId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
      console.log(response.data)
      setFriends(response.data.friends);
      alert('Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://soci-api1.onrender.com/api/users/friend-requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFriendRequests(friendRequests.filter(request => request._id !== requestId));
      alert('Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/'); // Navigate to the home page after logout
  };
 return (
    <div className="profile-container">
       <div class="profile-header">
    <h1>Profile</h1>
    <button class="logout-button" onClick={handleLogout}>Logout</button>
  </div>
      <div className="profile-info">
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
      </div>

      <div className="friends-list">
        <h2>Friends List</h2>
        <ul>
  {friends.map((friend) => (
    <li key={friend._id}>
      {friend.username}
      <Link to={`/profile/${friend.username}`}>View Profile</Link>
      <button className="chat-button" onClick={() => handleChatClick(friend.username)}>
        Chat
        {unreadMessageCounts[friend.username] > 0 && (
          <span className="unread-count">{unreadMessageCounts[friend.username]}</span>
        )}
      </button>
    </li>
  ))}
</ul>
      </div>

      <div className="search-results">
        <h2>Search for Friends</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for friends..."
          />
          <button type="submit">Search</button>
        </form>
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((result) => (
              <li key={result._id}>
                {result.username}
                <button onClick={() => handleSendFriendRequest(result.username)}>
                  Send Friend Request
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="friend-requests">
        <h2>Friend Requests</h2>
        <ul>
          {friendRequests.map((request) => (
            <li key={request._id}>
              {request.requester.username}
              <button onClick={() => handleAcceptFriendRequest(request._id)}>
                Accept
              </button>
              <button onClick={() => handleRejectFriendRequest(request._id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="posts">
        <h1>Posts</h1>
        <Link to="/add-post">
          <button>Add Post</button>
        </Link>
        {posts.map(post => (
        <div key={post._id}>
          <h3>{post.caption}</h3>
          <img src={post.imageBase64} alt={post.caption} />
          <button onClick={() => handleDeletePost(post._id)}>Delete</button>
          <div className="post-actions">
            <button onClick={() => handleLike(post._id)} className="like-button">Like</button>
            <span className="like-count">{post.likes.length} likes</span>
            <details className="like-details" onClick={() => fetchLikes(post._id)}>
              <summary>See who liked this</summary>
              <ul className="liked-users">
                {likes[post._id] ? (
                  likes[post._id].map((user) => (
                    <li key={user._id} className="liked-user">{user.username}</li>
                  ))
                ) : (
                  <li>No likes yet</li>
                )}
              </ul>
            </details>
          </div>
        </div>
      ))}

      </div>
    </div>
  );
};

export default Profile;
