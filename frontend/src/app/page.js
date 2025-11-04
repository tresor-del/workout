"use client";

import { useContext, useState, useEffect } from 'react';
import AuthContext from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';
import axios from 'axios';

const Home = () => {
    const { user, logout } = useContext(AuthContext);
    const [workouts, setWorkouts] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [workoutName, setWorkoutName] = useState('');
    const [workoutDescription, setWorkoutDescription] = useState('');
    const [routineName, setRoutineName] = useState('');
    const [routineDescription, setRoutineDescription] = useState('');
    const [selectedWorkouts, setSelectedWorkouts] = useState([]);

    // L'ancienne ligne "const token = localStorage.getItem('token');" a été supprimée,
    // car elle causait une erreur de rendu côté serveur. Le token est maintenant
    // récupéré directement dans les fonctions asynchrones, où il est utilisé.

    useEffect(() => {
      const fetchWorkoutsAndRoutines = async () => {
          try {
              // Récupération du token ici, dans un hook useEffect qui s'exécute côté client
              const token = localStorage.getItem("token");
              const [workoutsResponse, routinesResponse] = await Promise.all([
                  axios.get('http://localhost:8000/workouts/workouts', {
                      headers: { Authorization: `Bearer ${token}` },
                  }),
                  axios.get('http://localhost:8080/routines/routines', {
                      headers: { Authorization: `Bearer ${token}` },
                  }),
              ]);
              setWorkouts(workoutsResponse.data);
              setRoutines(routinesResponse.data);
          } catch (error) {
              console.error('Failed to fetch data:', error);
          }
      };

      fetchWorkoutsAndRoutines();
    }, []);

    const handleCreateWorkout = async (e) => {
        e.preventDefault();
        try {
            // Récupération du token ici pour l'appel API
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/workouts', {
                name: workoutName,
                description: workoutDescription,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setWorkouts([...workouts, response.data]);
            setWorkoutName('');
            setWorkoutDescription('');
        } catch (error) {
            console.error('Failed to create workout:', error);
        }
    };

    const handleCreateRoutine = async (e) => {
      e.preventDefault();
      try {
          // Récupération du token ici pour l'appel API
          const token = localStorage.getItem('token');
          const response = await axios.post('http://localhost:8080/routines', {
              name: routineName,
              description: routineDescription,
              workouts: selectedWorkouts,
          }, {
              headers: { Authorization: `Bearer ${token}` },
          });
          setRoutineName('');
          setRoutineDescription('');
          setSelectedWorkouts([]);
      } catch (error) {
          console.error('Failed to create routine:', error);
      }
    };

    return (
      <ProtectedRoute>
        <div className="container">
          <h1>Welcome!</h1>
          <button onClick={logout} className="btn btn-danger">Logout</button>
          <div className="accordion mt-5 mb-5" id="accordionExample">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                  Create Workout
                </button>
              </h2>
                  <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                      <form onSubmit={handleCreateWorkout}>
                        <div className="mb-3">
                          <label htmlFor="workoutName" className="form-label">Workout Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="workoutName"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="workoutDescription" className="form-label">Workout Description</label>
                          <input
                            type="text"
                            className="form-control"
                            id="workoutDescription"
                            value={workoutDescription}
                            onChange={(e) => setWorkoutDescription(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">Create Workout</button>
                      </form>
                    </div>
                  </div>
              <h2 className="accordion-header" id="headingTwo">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  Create Routine
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <form onSubmit={handleCreateRoutine}>
                    <div className="mb-3">
                      <label htmlFor="routineName" className="form-label">Routine Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="routineName"
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="routineDescription" className="form-label">Routine Description</label>
                      <input
                        type="text"
                        className="form-control"
                        id="routineDescription"
                        value={routineDescription}
                        onChange={(e) => setRoutineDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="workouts" className="form-label">Select Workouts</label>
                      <select
                        id="workouts"
                        className="form-select"
                        multiple
                        value={selectedWorkouts}
                        onChange={(e) => setSelectedWorkouts(Array.from(e.target.selectedOptions, option => option.value))}
                      >
                        {workouts.map(workout => (
                          <option key={workout._id} value={workout._id}>
                            {workout.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Routine</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
};

export default Home;
