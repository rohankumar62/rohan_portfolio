"use client";
import { useEffect } from "react";
import { createScope } from "../lib/scope";
import Header from "./Header";
import HeroSection from "./HeroSection";
import Section2Section from "./Section2Section";
import AboutSection from "./AboutSection";
import PlaygroundSection from "./PlaygroundSection";
import SkillsSection from "./SkillsSection";
import ProjectsSection from "./ProjectsSection";
import GithubSection from "./GithubSection";
import EducationSection from "./EducationSection";
import ApproachSection from "./ApproachSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";
import { initInteractions } from "../lib/interactions";
import { initStudio } from "../lib/studio";
import { initGithub } from "../lib/github";
import { initTechColors } from "../lib/tech-colors";

export default function Portfolio() {
  useEffect(() => {
    const scope = createScope();
    initInteractions(scope);
    initStudio(scope);
    initGithub(scope);
    initTechColors(scope);
    return () => scope.dispose();
  }, []);
  return (<><Header /><main><HeroSection /><Section2Section /><AboutSection /><PlaygroundSection /><SkillsSection /><ProjectsSection /><GithubSection /><EducationSection /><ApproachSection /><ContactSection /></main><Footer /><FloatingContact /></>);
}
