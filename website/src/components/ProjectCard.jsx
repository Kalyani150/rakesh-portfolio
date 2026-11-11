import { Link } from "react-router-dom";

// One project tile: image, name on hover, click opens the project page.
export default function ProjectCard({ project }) {
  return (
    <Link className="card" to={`/project/${project.id}`} state={{ project }}>
      <div className="thumb-hover" aria-hidden="true"><span>{project.title}</span><i>View project ↗</i></div>
      <div className="thumb">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title} loading="lazy" />
        ) : (
          <div className="thumb-fallback">{(project.title || "?").charAt(0)}</div>
        )}
      </div>
      <div className="card-body">
        {project.category && <span className="tag">{project.category}</span>}
        <h3>{project.title}</h3>
        {project.description && <p className="desc">{project.description}</p>}
      </div>
    </Link>
  );
}