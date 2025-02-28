// update imports ai!
export default function Form() {
  return (
    <Form
      className="w-full max-w-md mx-auto"
      action={async (formData) => {
        const result = await createWorkout(formData);
        setActionResult(result);
        return result;
      }}
      onChange={handleFormChange}
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-xs">
          <label className="form-control w-full">
            <div className="label sr-only">
              <span className="label-text">Sport</span>
            </div>
            <select name="activityType" className="select select-bordered w-full">
              <option disabled selected>Sport</option>
              {activities().map(([value, activity]) => (
                <option key={value} value={value}>{activity}</option>
              ))}
            </select>
          </label>
        </div>

        {formState?.activityType !== 'swimBikeRun' && (
          <div className="w-full max-w-xs">
            <label className="form-control w-full">
              <div className="label sr-only">
                <span className="label-text">Workout type</span>
              </div>
              <select name="goalSelectMenu" className="select select-bordered w-full">
                <option disabled selected>Workout type</option>
                <option value="open">Open goal</option>
                <option value="distance">Distance</option>
                <option value="calories">Calories</option>
                <option value="time">Time</option>
                <option value="pacer">Pacer</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        )}

        {formState?.workoutType !== workoutType.swimBikeRunWorkout && (
          <>
            <div className="w-full max-w-xs">
              <label className="form-control w-full">
                <div className="label sr-only">
                  <span className="label-text">Goal</span>
                </div>
                <select name="goal" className="select select-bordered w-full">
                  <option disabled selected>Goal</option>
                  {workoutGoals().map(([value, activity]) => (
                    <option key={value} value={value}>{activity}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="w-full max-w-xs">
              <WorkoutGoalInput type={formState?.goal as WorkoutGoalTypes} />
            </div>
            <div className="w-full max-w-xs">
              <label className="form-control w-full">
                <div className="label sr-only">
                  <span className="label-text">Name</span>
                </div>
                <input name="displayName" type="text" placeholder="Name" className="input input-bordered w-full" />
              </label>
            </div>
            <div className="w-full max-w-xs">
              <label className="form-control w-full">
                <div className="label sr-only">
                  <span className="label-text">Author</span>
                </div>
                <input name="author" type="text" placeholder="Author" className="input input-bordered w-full" />
              </label>
            </div>
          </>
        )}

        <div className="w-full max-w-xs">
          <button className="btn btn-primary w-full">Create workout</button>
        </div>
      </div>
    </Form>
  )
}