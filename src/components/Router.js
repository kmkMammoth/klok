import React, { useState, useEffect } from 'react';
import HomePage from './HomePage';
import Register from './Register';
import Login from './Login';

function Router() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // 监听 hash 变化
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // 移除 #
      if (hash === 'register') {
        setCurrentPage('register');
      } else if (hash === 'login') {
        setCurrentPage('login');
      } else {
        setCurrentPage('home');
      }
    };

    // 初始化
    handleHashChange();

    // 添加事件监听
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (currentPage === 'register') {
    return <Register />;
  }

  if (currentPage === 'login') {
    return <Login />;
  }

  return <HomePage />;
}

export default Router;

