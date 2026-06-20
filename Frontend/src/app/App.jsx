
import "./App.css";
import {Editor} from "@monaco-editor/react";
import {MonacoBinding} from "y-monaco"
import {useRef, useMemo, useState,useEffect} from "react"
import * as Y from "yjs"
import {SocketIOProvider} from "y-socket.io"


function App() {

  const [editor, setEditor] = useState(null)
  const [username,setUsername]= useState(()=>{
    return new URLSearchParams(window.location.search).get("username") || "" 
  })

  const [users,setUsers]=useState([])

  const ydoc=useMemo(()=>new Y.Doc(),[])
  const yText= useMemo(()=>ydoc.getText("monaco"),[ydoc])
  

  

  const handleMount=(editor)=>{
    setEditor(editor);
  }

  useEffect(()=>{  
    if(username && editor){
      const provider= new SocketIOProvider("/",
    "monaco",
    ydoc,
    {
      autoconnect:true,
      
    }
    
  )

  provider.awareness.setLocalStateField("user",{username})


  const states= Array.from(provider.awareness.getStates().values())
  setUsers(states.filter(state=>state.user && state.user.username).map(state=>state.user))

  provider.awareness.on("change",()=>{
    const states= Array.from(provider.awareness.getStates().values())
    setUsers(states.filter(state=>state.user && state.user.username).map(state=>state.user))
  })

  function handleBeforeUnload(){
    provider.awareness.setLocalStateField("user",null)

  }

  window.addEventListener("beforeunload",handleBeforeUnload)

  const  monacoBinding=new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    )

    return()=>{
      
      monacoBinding.destroy()
      provider.disconnect()
    }


    } 
  },[editor,username])

  const handleJoin=(e)=>{
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({},"","?username="+e.target.username.value)
  }

  if(!username){
    return(
      <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">

        <form
        onSubmit={handleJoin}
        className="flex flex-col gap-4"
        >
        <input
        type="text"
        placeholder="Enter  username"
        name="username"
        className="outline-none px-4 bg-gray-900 py-2 rounded-md text-gray-300 w-64 text-center placeholder:text-gray-300"
        />
        <button
        className="p-2 rounded-lg bg-white text-black font-bold"
        >
        Join
        </button>


        </form>
      </main>
    )
  }


  return (
   <main
   className='h-screen w-full bg-gray-950 flex gap-4 p-4'>
    <aside
    className='h-full w-1/4 bg-amber-50 rounded-lg '>
      <h2>Users</h2>
      <ul>
        {
          users.map((user,index)=>(
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">{user.username}</li>
          ))
        }
      </ul>
    </aside>
    <section
    className='w-3/4 bg-nutral-800 rounded-lg overflow-hidden'>

      <Editor
      height="100%"
      width="100%"
      language="javascript"
      value="console.log('hello world');"
      theme="vs-dark"
      onMount={handleMount}
      />
    </section>

   </main>
  )
}

export default App
