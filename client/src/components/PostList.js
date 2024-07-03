// src/components/PostList.js
import React from 'react';

const PostList = ({ posts }) => {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post._id} className="post">
          <img src={post.image} alt={post.caption} className="post-image"  />
          <p>{post.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
