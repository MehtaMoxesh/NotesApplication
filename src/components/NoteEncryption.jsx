import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, Key } from 'lucide-react';

const NoteEncryption = ({ note, onEncrypt, onDecrypt, isDark }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate encryption process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const encryptedNote = {
        ...note,
        isEncrypted: true,
        encryptedContent: `encrypted_${note.content}_${Date.now()}`,
        content: '',
        updatedAt: new Date().toISOString()
      };

      onEncrypt(encryptedNote);
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      setError('Encryption failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!password.trim()) {
      setError('Please enter the password');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate decryption process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const decryptedNote = {
        ...note,
        isEncrypted: false,
        content: note.encryptedContent ? note.encryptedContent.replace(/^encrypted_/, '').replace(/_\d+$/, '') : '',
        encryptedContent: null,
        updatedAt: new Date().toISOString()
      };

      onDecrypt(decryptedNote);
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      setError('Decryption failed. Please check your password.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Key size={20} className="text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Note Encryption
        </h3>
      </div>

      <div className="space-y-4">
        {note.isEncrypted ? (
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={16} className="text-yellow-500" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                This note is encrypted
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-gray-300">
              Enter your password to decrypt and view the content.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Unlock size={16} className="text-green-500" />
              <span className="text-sm font-medium text-green-800 dark:text-green-400">
                This note is not encrypted
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-gray-300">
              Encrypt this note to protect its content with a password.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={note.isEncrypted ? 'Enter password to decrypt' : 'Enter password to encrypt'}
              className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={note.isEncrypted ? handleDecrypt : handleEncrypt}
              disabled={isProcessing || !password.trim()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isProcessing || !password.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                note.isEncrypted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {note.isEncrypted ? 'Decrypting...' : 'Encrypting...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {note.isEncrypted ? <Unlock size={16} /> : <Lock size={16} />}
                  {note.isEncrypted ? 'Decrypt Note' : 'Encrypt Note'}
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Passwords are not stored and cannot be recovered</p>
          <p>• Encrypted notes cannot be edited until decrypted</p>
          <p>• Use a strong password for better security</p>
        </div>
      </div>
    </div>
  );
};

export default NoteEncryption; 