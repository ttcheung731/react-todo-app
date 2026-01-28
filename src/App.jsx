import React from 'react'
import './App.css'
import { useState, useRef } from 'react'
import ding from './assets/ding.mp3'
const API_URL = import.meta.env.VITE_API_URL

function App() {
  const audioRef = useRef(new Audio(ding))

  const [jobs, setJobs] = useState([])
  const [newJob, setNewJob] = useState('')
  const [hoveredJobId, setHoveredJobId] = useState(null)
  const [draggedId, setDraggedId] = useState(null)

  const [overId, setOverId] = useState(null)

  async function addJob() {
    if (newJob.trim() === '') {
      return
    }

    // play sound when adding a job
    audioRef.current.currentTime = 0
    audioRef.current.play()

    try {
      const response = await fetch(API_URL + "/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newJob
        })
      })

      const createdJob = await response.json()

      if (!response.ok) {
        alert(createdJob.message || "Failed to add job")
        return
      }

      // use the job returned from MongoDB
      setJobs([createdJob].concat(jobs))
      setNewJob('')
    } catch (error) {
      alert("Could not connect to backend")
    }
  }

  function deleteJob(jobId) {
    audioRef.current.currentTime = 0
    audioRef.current.play()

    const updatedJobs = jobs.filter(function (job) {
      return job._id !== jobId
    })

    setJobs(updatedJobs)
  }


  return (
    <div className="app">
      <h1>To Do List</h1>

      <input
        type="text"
        value={newJob}
        onChange={function (event) {
          setNewJob(event.target.value)
        }}
        onKeyDown={function (event) {
          if (event.key === 'Enter') {
            addJob()
          }
        }}
        placeholder="Enter a job"
      />

      <button onClick={addJob}>
        Add Job
      </button>

      <ol>
        {jobs.map(function (job) {
          const jobId = job._id

          const isHovered = hoveredJobId === jobId
          const isOver = overId === jobId

          const classNameValue = isOver
            ? 'job hovered' // you can change this to 'job over' if you add CSS
            : isHovered
              ? 'job hovered'
              : 'job'

          return (
            <li
              key={jobId}
              className={classNameValue}
              draggable
              onMouseEnter={function () {
                setHoveredJobId(jobId)
              }}
              onMouseLeave={function () {
                setHoveredJobId(null)
              }}
              onClick={function () {
                deleteJob(jobId)
              }}
              onDragStart={function () {
                setDraggedId(jobId)
              }}
              onDragOver={function (event) {
                event.preventDefault() // allows dropping
                setOverId(jobId)
              }}
              onDrop={function (event) {
                event.preventDefault()

                // guard: dropped onto itself or no dragged item
                if (!draggedId || draggedId === jobId) {
                  setDraggedId(null)
                  setOverId(null)
                  return
                }

                // reorder
                const copy = jobs.slice()

                const fromIndex = copy.findIndex(function (j) {
                  return j._id === draggedId
                })

                const toIndex = copy.findIndex(function (j) {
                  return j._id === jobId
                })

                if (fromIndex === -1 || toIndex === -1) {
                  setDraggedId(null)
                  setOverId(null)
                  return
                }

                const draggedItem = copy.splice(fromIndex, 1)[0]
                copy.splice(toIndex, 0, draggedItem)

                setJobs(copy)

                // clean up
                setDraggedId(null)
                setOverId(null)
              }}
            >
              {job.title}
            </li>
          )
        })}


      </ol>
    </div>
  )
}

export default App
