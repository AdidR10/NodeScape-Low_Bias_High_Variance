import React from 'react';

const KeyboardShortcuts = ({ onShortcut }) => {
  const shortcuts = [
    { key: 'Space', action: 'Play/Pause Algorithm' },
    { key: 'R', action: 'Run Algorithm' },
    { key: 'C', action: 'Clear Graph' },
    { key: 'E', action: 'Toggle Add Edge Mode' },
    { key: 'A', action: 'Add Node (click location)' },
    { key: 'Delete', action: 'Remove Selected Node' },
    { key: '←', action: 'Previous Step' },
    { key: '→', action: 'Next Step' },
    { key: 'Home', action: 'Reset to Start' },
    { key: 'End', action: 'Go to End' },
    { key: '1-6', action: 'Load Preset (1-6)' },
    { key: 'H', action: 'Toggle Help' },
  ];

  return (
    <div className="keyboard-shortcuts">
      <h4>⌨️ Keyboard Shortcuts</h4>
      <div>
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="shortcut-item">
            <span>{shortcut.action}</span>
            <span className="shortcut-key">{shortcut.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcuts; 