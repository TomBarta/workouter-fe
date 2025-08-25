'use client'

import WorkoutForm from '@/app/landing/form';

export default function Page() {

  return (
    <main>
      <section className="bg-brand-gradient-dark min-h-screen flex flex-col">
        <div className="text-center px-4 py-8">
          <h1 className="text-5xl font-bold text-wktr-black-800">Welcome to<br /> Workouter</h1>
          <p className="py-6">
            Build workouts for Apple Watch.
            For free.
          </p>
          <div className="flex justify-center">
            <WorkoutForm />
          </div>
        </div>
      </section>
    </main>
  );
}
