import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../../api/client";
import { isRegisteredBlockComponent } from "../../components/learning/block-component-settings/blockRegistry";
import { useAuth } from "../../context/AuthContext";
import { categoryLabel, groupTemplatesByCategory } from "../../lib/blockCategories";

import "../../styles/pages/block-templates.css";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/*
 * Developer page: every block template, grouped by category, with how
 * many learning blocks use each one.
 */
function BlockTemplateListPage() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  // One-off message from the form page (saved / deleted).
  const [flash, setFlash] = useState(() => location.state?.flash ?? null);

  useEffect(() => {
    if (location.state?.flash) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/dev/block-templates", { token });
      setTemplates(data?.block_templates ?? []);
      setCategories(data?.block_categories ?? []);
    } catch (requestError) {
      setError(requestError.status ? requestError.message : "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Fetching on mount is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const query = search.trim().toLowerCase();
  const visible = templates.filter(
    (template) =>
      (category === "all" || template.block_category_id === category) &&
      (status === "all" || template.status === status) &&
      (!query ||
        [template.name, template.component, template.description, ...(template.tags || [])]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(query)))
  );

  const countFor = (id) => templates.filter((template) => template.block_category_id === id).length;

  return (
    <div className="mx-page mx-templates">
      <header className="mx-templates__head">
        <div>
          <h1>Block templates</h1>
          <p className="mx-hint">
            The block types teachers add to topics in the course builder. Only
            developers can see this page.
          </p>
        </div>
        <Link className="mx-btn" to="/dev/block-templates/new">
          ➕ New template
        </Link>
      </header>

      {flash && (
        <div className={`mx-feedback mx-feedback--${flash.tone || "good"} mx-templates__flash`} role="status">
          <span>{flash.text}</span>
          <button type="button" className="mx-templates__flash-close" onClick={() => setFlash(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      {isLoading && <p className="mx-hint">Loading templates…</p>}

      {!isLoading && error && (
        <div className="mx-feedback mx-feedback--bad" role="alert">
          {error}{" "}
          <button type="button" className="mx-btn mx-btn--ghost mx-btn--sm" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="mx-templates__controls">
            <input
              type="search"
              className="mx-templates__search"
              placeholder="Search name, component or tag…"
              aria-label="Search templates"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="mx-templates__chips" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`mx-chip${status === filter.value ? " is-on" : ""}`}
                  aria-pressed={status === filter.value}
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-templates__chips mx-templates__categories" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`mx-chip${category === "all" ? " is-on" : ""}`}
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              All categories <span className="mx-templates__count">{templates.length}</span>
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mx-chip${category === item.id ? " is-on" : ""}`}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {categoryLabel(item)}
                {item.status === "inactive" && " (inactive)"}{" "}
                <span className="mx-templates__count">{countFor(item.id)}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="mx-empty">
              <span className="mx-empty__emoji" aria-hidden="true">
                🧱
              </span>
              <h2>{templates.length ? "No matching templates" : "No templates yet"}</h2>
              <p>{templates.length ? "Try a different search or filter." : "Create the first block type for teachers."}</p>
            </div>
          ) : (
            groupTemplatesByCategory(visible, categories).map(({ category: item, templates: inGroup }) => {
              return (
                <section key={item.id ?? "uncategorised"} className="mx-templates__group" style={{ "--mx-wc": item.color }}>
                  <h2 className="mx-world__label">
                    {categoryLabel(item)}
                    {item.status === "inactive" && " · inactive"}
                  </h2>

                  <ul className="mx-templates__list">
                    {inGroup.map((template) => (
                      <li key={template.id}>
                        <Link className="mx-template-row" to={`/dev/block-templates/${template.id}/edit`}>
                          <span className="mx-template-row__icon" aria-hidden="true">
                            {template.icon || "🧱"}
                          </span>

                          <span className="mx-grow">
                            <b>{template.name}</b>
                            <span className="mx-template-row__meta">
                              <code>{template.component}</code>
                              {!isRegisteredBlockComponent(template.component) && (
                                <span className="mx-tag mx-template-row__warn" title="The frontend block registry has no component with this name, so blocks of this type can't render.">
                                  ⚠️ No frontend component
                                </span>
                              )}
                              {(template.tags || []).map((tag) => (
                                <span key={tag} className="mx-template-row__tag">
                                  #{tag}
                                </span>
                              ))}
                            </span>
                          </span>

                          <span className="mx-template-row__usage">
                            {template.learning_blocks_count ?? 0}
                            <small> block{template.learning_blocks_count === 1 ? "" : "s"}</small>
                          </span>

                          <span
                            className={`mx-tag ${
                              template.status === "active" ? "mx-status-tag--published" : "mx-status-tag--draft"
                            }`}
                          >
                            {template.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}

export default BlockTemplateListPage;
