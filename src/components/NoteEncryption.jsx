import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import CryptoJS from 'crypto-js';

const NoteEncryption = ({ note, onEncrypt, onDecrypt, isDark }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate a random salt
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      
      // Hash the password with the salt
      const hashedPassword = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000
      }).toString();

      // Encrypt the content
      const encryptedContent = CryptoJS.AES.encrypt(
        note.content,
        hashedPassword
      ).toString();

      // Create the encrypted note
      const encryptedNote = {
        ...note,
        content: encryptedContent,
        isEncrypted: true,
        encryptionData: {
          salt: salt.toString(),
          hashedPassword: hashedPassword
        }
      };

      onEncrypt(encryptedNote);
      setPassword('');
    } catch (err) {
      console.error('Error encrypting note:', err);
      setError('Failed to encrypt note');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Hash the entered password with the stored salt
      const hashedPassword = CryptoJS.PBKDF2(
        password,
        CryptoJS.enc.Hex.parse(note.encryptionData.salt),
        {
          keySize: 256 / 32,
          iterations: 1000
        }
      ).toString();

      // Verify password
      if (hashedPassword !== note.encryptionData.hashedPassword) {
        setError('Incorrect password');
        return;
      }

      // Decrypt the content
      const decryptedContent = CryptoJS.AES.decrypt(
        note.content,
        hashedPassword
      ).toString(CryptoJS.enc.Utf8);

      // Create the decrypted note
      const decryptedNote = {
        ...note,
        content: decryptedContent,
        isEncrypted: false,
        encryptionData: null
      };

      onDecrypt(decryptedNote);
      setPassword('');
    } catch (err) {
      console.error('Error decrypting note:', err);
      setError('Failed to decrypt note');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${
      isDark 
        ? 'bg-gray-800 border-gray-700 text-gray-100' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        {note.isEncrypted ? (
          <Lock size={20} className="text-yellow-500" />
        ) : (
          <Unlock size={20} className="text-green-500" />
        )}
        <h3 className="font-semibold">
          {note.isEncrypted ? 'Note Encryption' : 'Encrypt Note'}
        </h3>
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          isDark 
            ? 'bg-red-900/20 text-red-400' 
            : 'bg-red-50 text-red-700'
        }`}>
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={note.isEncrypted ? 'Enter password to decrypt' : 'Enter password to encrypt'}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${
              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            }`}
          >
            {showPassword ? (
              <EyeOff size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            ) : (
              <Eye size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            )}
          </button>
        </div>

        <button
          onClick={note.isEncrypted ? handleDecrypt : handleEncrypt}
          disabled={isProcessing}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
            note.isEncrypted
              ? isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
              : isDark
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : note.isEncrypted ? (
            <>
              <Unlock size={16} />
              <span>Decrypt Note</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>Encrypt Note</span>
            </>
          )}
        </button>

        {note.isEncrypted && (
          <p className={`text-sm text-center ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            This note is encrypted. Enter the password to view or edit its contents.
          </p>
        )}
      </div>
    </div>
  );
};

export default NoteEncryption; 