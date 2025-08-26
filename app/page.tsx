'use client'

import WorkoutForm from '@/app/landing/form';

export default function Page() {

  return (
    <main>
      <section className="bg-brand-gradient-dark min-h-screen flex flex-col">
        <div className="text-center px-4 py-8">
          <h1 className="text-5xl font-bold text-wktr-orange-600">Welcome to<br /> Workouter</h1>
          <p className="py-6 text-wktr-orange-300">
            Build Apple Watch workouts.
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
