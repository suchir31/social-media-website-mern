import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
const ViewProfile = () => {
  const { username } = useParams(); // Use 'username' instead of 'friendUsername'
  console.log(username,"ll")
  const [friendInfo, setFriendInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const fetchFriendInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://soci-api1.onrender.com/api/users/${username}/friends`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFriendInfo(response.data);
      } catch (error) {
        console.error('Error fetching friend info:', error);
      }
    };

     const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        const response = await axios.get(`https://soci-api1.onrender.com/api/posts/${username}`, {
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

    fetchFriendInfo();
    fetchPosts();
  }, [username]); // Use 'username' in the dependency array

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

  if (!friendInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{username}'s Profile</h1>
      <button className="back-button" onClick={() => navigate('/profile')}>Back</button>
      <h2>Friends</h2>
      <ul>
        {friendInfo.map((friend) => (
          <li key={friend._id}>{friend.username}</li>
        ))}
      </ul>
      <h2>Posts</h2>
      <div>
        {posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} >
              <h3>{post.caption}</h3>
               <img src={post.imageBase64} alt={post.caption} />
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
          ))
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
