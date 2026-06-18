"use client";

import React from "react";

interface Project {
  id: string;
  name: string;
  desc: string;
  tags: string[];
  color: string;
  github?: string;
  live?: string;
}

interface ProjectCardProps {
  project: Project;
  totalProjects: number;
}

const IMAGES_MAP: Record<string, string> = {
  "ApexTrader": "/images/apextrader.png",
  "AutiConnect": "/images/autoconnect.png",
  "StoreBase": "/images/storebase.png",
  "MedConnect": "/images/medconnect.png",
};

export default function ProjectCard({ project, totalProjects }: ProjectCardProps) {
  const projectLink = project.live || project.github;
  const imageSrc = IMAGES_MAP[project.name];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Calculate rotation (-8deg to 8deg)
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <div
      className="project-card glass-panel glass-panel-hover tilt-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-hover
    >
      {/* Top color line indicator */}
      <div className="project-color-line" style={{ background: project.color }} />

      {/* 3D Inner Container */}
      <div className="tilt-inner" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        
        {/* Project Link Arrow */}
        {projectLink ? (
          <a
            href={projectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="project-arrow"
            style={{ cursor: "none", textDecoration: "none" }}
          >
            ↗
          </a>
        ) : (
          <div className="project-arrow">↗</div>
        )}

        {/* Project Header Number */}
        <div className="project-num">
          {project.id} / {totalProjects < 10 ? `0${totalProjects}` : totalProjects}
        </div>

        {/* Project Cover Image */}
        {imageSrc ? (
          <div className="project-image-wrap">
            <img src={imageSrc} alt={project.name} className="project-card-image" />
            <div className="project-card-image-overlay" />
          </div>
        ) : (
          /* Abstract decorative graphic for projects without covers */
          <div className="project-abstract-graphic">
            <div className="project-graphic-grid" />
            <div className="project-graphic-glow" style={{ background: `radial-gradient(circle, ${project.color}15 0%, transparent 70%)` }} />
            <span className="project-graphic-code">&lt;/{project.name.replace(/\s+/g, "").toLowerCase()}&gt;</span>
          </div>
        )}

        {/* Name and Description */}
        <h3 className="project-name">{project.name}</h3>
        <p className="project-desc">{project.desc}</p>

        {/* Footer actions & tags */}
        <div style={{ marginTop: "auto" }}>
          {(project.github || project.live) && (
            <div className="project-links">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover
                  className="project-link project-link-gh"
                >
                  GitHub ↗
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover
                  className="project-link project-link-live"
                >
                  Live ↗
                </a>
              )}
            </div>
          )}

          <div className="project-tags">
            {project.tags.map((t) => (
              <span key={t} className="project-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
