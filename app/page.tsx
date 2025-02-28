'use client'

import Form from '@/app/landing/form';

  return (
    <main>
      <section className="bg-base-200 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center px-4 py-8">
          <h1 className="text-5xl font-bold">Welcome to Workouter</h1>
          <p className="py-6">
            Build workouts for Apple Watch.
            For free.
          </p>
          <div className="flex justify-center">
            <Form />
          </div>
        </div>
      </section>
    </main>
  );
}
