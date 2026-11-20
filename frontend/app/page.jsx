"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="pti-app">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content" className="relative">
        <Hero />
        <div className="relative">
          <Features />
        </div>
        <Pricing />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
