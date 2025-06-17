// Glossary data with AI/tech terms
export const glossaryTerms = {
  'artificial intelligence': 'A branch of computer science dealing with the simulation of intelligent behavior in computers.',
  'machine learning': 'A type of artificial intelligence that enables computers to learn without being explicitly programmed.',
  'neural network': 'A computing system inspired by biological neural networks that constitute animal brains.',
  'algorithm': 'A process or set of rules to be followed in calculations or other problem-solving operations.',
  'data science': 'An interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge from data.',
  'deep learning': 'A subset of machine learning based on artificial neural networks with representation learning.',
  'api': 'Application Programming Interface - a set of protocols and tools for building software applications.',
  'cloud computing': 'The delivery of computing services over the internet including storage, processing power, and applications.',
  'blockchain': 'A distributed ledger technology that maintains a continuously growing list of records secured using cryptography.',
  'react': 'A JavaScript library for building user interfaces, particularly web applications.',
  'javascript': 'A high-level programming language commonly used for web development.',
  'css': 'Cascading Style Sheets - a language used for describing the presentation of web pages.',
  'html': 'HyperText Markup Language - the standard markup language for creating web pages.',
  'database': 'An organized collection of structured information or data stored electronically.',
  'frontend': 'The part of a website or application that users interact with directly.',
  'backend': 'The server-side of an application that handles data processing and storage.',
  'responsive design': 'An approach to web design that makes web pages render well on various devices and screen sizes.',
  'user experience': 'The overall experience of a person using a product, especially in terms of how easy or pleasing it is to use.',
  'version control': 'A system that records changes to files over time so you can recall specific versions later.',
  'framework': 'A platform for developing software applications that provides a foundation of pre-written code.',
  'library': 'A collection of pre-written code that developers can use to optimize tasks.',
  'component': 'A reusable piece of code that defines how a certain part of your UI should appear.',
  'state': 'Data that determines how a component renders and behaves at any given time.',
  'props': 'Arguments passed into React components, similar to function arguments.',
  'hooks': 'Functions that let you use state and other React features in functional components.'
};

// AI-powered term detection (simulated)
export const detectKeyTerms = (text) => {
  const words = text.toLowerCase().split(/\W+/);
  const detectedTerms = [];
  
  // Check for exact matches and partial matches
  Object.keys(glossaryTerms).forEach(term => {
    const termWords = term.split(' ');
    if (termWords.length === 1) {
      if (words.includes(term)) {
        detectedTerms.push(term);
      }
    } else {
      // For multi-word terms, check if they appear in sequence
      const termPattern = new RegExp(term.replace(/\s+/g, '\\s+'), 'gi');
      if (termPattern.test(text)) {
        detectedTerms.push(term);
      }
    }
  });
  
  return detectedTerms;
};

export default glossaryTerms;