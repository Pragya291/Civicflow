import React from 'react';
import LoginPage from './LoginPage';

export default function Register(props) {
  return <LoginPage {...props} initialRegister={true} />;
}
