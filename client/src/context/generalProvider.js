import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const socket = io.connect(`https://yolohome.onrender.com`);
const GeneralContext = createContext({});

export const GeneralProvider = ({ children }) => {
  return <GeneralContext.Provider value={{ socket }}>{children}</GeneralContext.Provider>;
};

export default GeneralContext;
