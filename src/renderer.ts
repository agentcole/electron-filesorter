import { IPC_CHANNELS } from "./shared/ipc-constants";
import "./index.css";

window.electronAPI.onDirectorySelected((path: string) => {
  document.getElementById(
    "selected-path"
  )!.innerText = `Selected Directory: ${path}`;
});

window.electronAPI.onFileUpdated((data: any) => {
  console.log("File update received:", data);
});

// Settings Initialization and Change Handling
document.addEventListener("DOMContentLoaded", () => {
  const autoProcess = localStorage.getItem("autoProcess") === "true";
  (document.getElementById("auto-process-toggle") as HTMLInputElement).checked =
    autoProcess;
});

document
  .getElementById("auto-process-toggle")!
  .addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    localStorage.setItem("autoProcess", target.checked.toString());
  });

// Directory Selection Handling
document.getElementById("search")!.addEventListener("click", async () => {
  const query = (document.getElementById("search-field") as HTMLInputElement)
    .value;

  // const searchRes = await window.electronAPI.searchVectorDb(query);
  const searchRes = await window.electronAPI.searchFuseDb(query);
  console.log(searchRes);
  // document.querySelector("#results").innerHTML = searchRes.sort((a,b )=> a._distance - b._distance)
  document.querySelector("#results").innerHTML = searchRes.map((item) => "<p>" + item.file_path + "</p>")
    .join("");
});
document
  .getElementById("select-directory")!
  .addEventListener("click", async () => {
    try {
      const directoryPath = await window.electronAPI.selectDirectory();
      if (directoryPath) {
        const structure = await window.electronAPI.getDirectoryStructure(
          directoryPath
        );
        console.log(
          "Main Directory Structure:",
          JSON.stringify(structure, null, 2)
        );
        displayStructure(structure);
      }
    } catch (err) {
      console.error("Error getting directory structure:", err);
    }
  });

// Drag-and-Drop Handling
const dropArea = document.getElementById("drop-area")!;
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.stopPropagation();
  (event.dataTransfer as DataTransfer).dropEffect = "copy";
});

dropArea.addEventListener("drop", async (event) => {
  event.preventDefault();
  event.stopPropagation();
  const items = Array.from(
    (event.dataTransfer as DataTransfer).files,
    (file) => file.path
  );
  const autoProcess = (
    document.getElementById("auto-process-toggle") as HTMLInputElement
  ).checked;
  try {
    const structure = await window.electronAPI.processDroppedItems(items);
    displayStructure(structure);

    if (autoProcess) {
      for (const item of structure) {
        if (item.type === "file") {
          try {
            const aiResponse = await window.electronAPI.performApiRequest({
              fileName: item.name,
              filePath: item.path,
            });
            console.log("API Response:", aiResponse);
            // const destPath = JSON.parse(aiResponse);
            // console.log(destPath);
            // console.log(await window.electronAPI.moveFile(item.path, destPath.path));
          } catch (error) {
            console.error(`Error processing ${item.name}:`, error);
          }
        } else {
          alert("Folder currently not supported.");
        }
      }
    }
  } catch (err) {
    console.error("Error processing dropped items:", err);
  }
});

// Helper function to create a list element from items
function createList(items: any[]): HTMLUListElement {
  const ul = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} (${item.type}, MIME: ${
      item.mimeType || "N/A"
    })`;
    if (item.children && item.children.length > 0) {
      li.appendChild(createList(item.children));
    }
    ul.appendChild(li);
  });
  return ul;
}

// Function to display directory structure
function displayStructure(structure: any[]): void {
  const directoryStructure = document.getElementById("directory-structure")!;
  directoryStructure.innerHTML = ""; // Clear previous content
  directoryStructure.appendChild(createList(structure));
}
