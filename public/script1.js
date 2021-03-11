let inRoom = false;
const createRoomButton = document.querySelector("#create-room-button")
const joinRoomButton = document.querySelector("#join-room-button")
const leaveRoomButton = document.querySelector("#leave-room-button")
const roomStatus = document.querySelector("#room-status");
const socket = io();
let currentRoomName="";

socket.on("connect",()=>{
    console.log("connected to server.")
    roomStatus.innerText="Room not created"
    roomStatus.style.backgroundColor="green"
    roomStatus.style.color="white"
    roomStatus.style.width="30%"
    roomStatus.style.fontFamily="monospace"
});


socket.on("disconnect",()=>{
    console.log("disconnected from server.")
    roomStatus.style.backgroundColor="red"
    roomStatus.style.color="white"
    roomStatus.innerText=`Disconnected from server. Room was abandoned.`
}
);


socket.on("created-room",()=>{
    roomStatus.innerText=`Room code : ${socket.id}`;
    leaveRoomButton.disabled=false;
    joinRoomButton.disabled=true;

    currentRoomName=socket.id;
    inRoom = true;
})


socket.on("joined-room",({name,roomName})=>{
    alert(`${name} joined the room!`)
    createRoomButton.disabled=true;
    joinRoomButton.disabled=true;
    leaveRoomButton.disabled = false;
    currentRoomName=roomName
    
    roomStatus.innerText=`Joined room : ${currentRoomName}    `
    inRoom = true;
})

createRoomButton.addEventListener("click",()=>{
    socket.emit("create-room");
    roomStatus.innerText="Creating room...";
    createRoomButton.disabled=true;
})

joinRoomButton.addEventListener('click',()=>{
    const code = prompt("Please enter room code: ");
    const name = prompt("Please enter your name: ")
    socket.emit('join-room',{roomName:code,name:name}); 
})
leaveRoomButton.addEventListener('click',()=>{
    alert("Button not functional yet.")
})
// socket.emit("hello-server",{message:"Hello"})
const cells = {
    Image: {
      xmlns: "http://schemas.microsoft.com/deepzoom/2009",
      Url: "./dzc_output_files/", //folder with tiles stored as images.
      Format: "jpg", //format of the tiles
      Overlap: "1",
      TileSize: "256",
      Size: {
        Width:  "364",
        Height: "274"
      }
    }
  };
  
const viewer = OpenSeadragon(
    {
        id: "seadragon-viewer", //id of the div with openseadragon viewer
        // element :document.querySelector('#seadragon-viewer'), //element can be provided instead of the element id.
        prefixUrl: "//openseadragon.github.io/openseadragon/images/", //url for images used in the viewer
        tileSources: cells,
        debugMode:true,
    }
);

//Handlers
viewer.addHandler("canvas-drag",()=>{
//   document.querySelector('#coordinate-show').innerText=`X: ${viewer.viewport.getCenter().x} Y:${viewer.viewport.getCenter().y}`
  if(inRoom){
    const center = viewer.viewport.getCenter(); 
    socket.emit("new-pan",{data:center,userName:socket.id,roomName:currentRoomName})
  }
})

socket.on("sync-pan",({data,userName,roomName})=>{
    if((userName!==socket.id)&&(currentRoomName===roomName)){
    viewer.viewport.panTo(data)
    }
})