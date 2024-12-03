import React, { createContext, useState, ReactNode, useContext } from 'react';
 
interface ModalContextProps {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  modalContent: ReactNode | null;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const openModal = (content: ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalContent }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
