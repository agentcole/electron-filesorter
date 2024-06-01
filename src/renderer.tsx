import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { IPC_CHANNELS } from './shared/ipc-constants';


const electron_window = (window as any).electronAPI;

const App: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [autoProcess, setAutoProcess] = useState<boolean>(false);
  const [directoryStructure, setDirectoryStructure] = useState<any[]>([]);

  useEffect(() => {
    electron_window.onDirectorySelected((path: string) => {
      setSelectedPath(path);
    });

    electron_window.onFileUpdated((data: any) => {
      console.log('File update received:', data);
    });

    const storedAutoProcess = localStorage.getItem('autoProcess') === 'true';
    setAutoProcess(storedAutoProcess);
  }, []);

  const handleAutoProcessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoProcess(event.target.checked);
    localStorage.setItem('autoProcess', event.target.checked.toString());
  };

  const handleSelectDirectory = async () => {
    try {
      const directoryPath = await electron_window.selectDirectory();
      if (directoryPath) {
        const structure = await electron_window.getDirectoryStructure(directoryPath);
        console.log('Main Directory Structure:', JSON.stringify(structure, null, 2));
        setDirectoryStructure(structure);
      }
    } catch (err) {
      console.error('Error getting directory structure:', err);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const items = Array.from(event.dataTransfer.files, (file) => file.path);
    try {
      const structure = await electron_window.processDroppedItems(items);
      setDirectoryStructure(structure);

      if (autoProcess) {
        for (const item of structure) {
          if (item.type === 'file') {
            try {
              const aiResponse = await electron_window.performApiRequest({
                fileName: item.name,
                filePath: item.path,
              });
              console.log('API Response:', aiResponse);
            } catch (error) {
              console.error(`Error processing ${item.name}:`, error);
            }
          } else {
            alert('Folder currently not supported.');
          }
        }
      }
    } catch (err) {
      console.error('Error processing dropped items:', err);
    }
  };

  const createList = (items: any[]): JSX.Element => {
    return (
      <ul>
        {items.map((item) => (
          <li key={item.name}>
            {item.name} ({item.type}, MIME: {item.mimeType || 'N/A'})
            {item.children && item.children.length > 0 && createList(item.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1>Electron React App</h1>
      <div>
        <label>
          Auto Process:
          <input type="checkbox" checked={autoProcess} onChange={handleAutoProcessChange} id="auto-process-toggle" />
        </label>
      </div>
      <div>
        <button onClick={handleSelectDirectory} id="select-directory">
          Select Directory
        </button>
        <div id="selected-path">Selected Directory: {selectedPath}</div>
      </div>
      <div id="drop-area" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
        Drag and drop files here
      </div>
      <div id="directory-structure">{createList(directoryStructure)}</div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
