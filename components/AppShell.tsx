import React from "react";

export default function AppShell({
  header,
  sidebar,
  canvas,
  editor
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  canvas: React.ReactNode;
  editor: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-50">
      <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none" />
      <div className="relative">
        <header className="px-8 py-6 flex items-center justify-between">
          {header}
        </header>
        <main className="grid grid-cols-12 gap-6 px-8 pb-10">
          <section className="col-span-12 lg:col-span-3">{sidebar}</section>
          <section className="col-span-12 lg:col-span-9">{canvas}</section>
        </main>
        <section className="px-8 pb-12">{editor}</section>
      </div>
    </div>
  );
}
