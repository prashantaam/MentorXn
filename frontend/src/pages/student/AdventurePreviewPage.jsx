import { useState } from "react";
import ContentBlock from "../../components/learning/ContentBlock";
import "../../styles/adventure-land.css";

function AdventurePreviewPage() {
  const [activeTopic, setActiveTopic] =
    useState("what-is-dotnet");

  const courseIndex = [
    {
      title: "🌍 Meet .NET",
      topics: [
        {
          id: "what-is-dotnet",
          icon: "🌐",
          title: "What is .NET?",
        },
        {
          id: "how-code-runs",
          icon: "⚙️",
          title: "How Code Runs",
        },
      ],
    },
    {
      title: "🧰 .NET CLI",
      topics: [
        {
          id: "dotnet-new",
          icon: "✨",
          title: "dotnet new",
        },
        {
          id: "dotnet-build",
          icon: "🔨",
          title: "dotnet build",
        },
        {
          id: "dotnet-run",
          icon: "▶️",
          title: "dotnet run",
        },
      ],
    },
    {
      title: "🧱 C# Basics",
      topics: [
        {
          id: "variables",
          icon: "📦",
          title: "Variables",
        },
        {
          id: "conditions",
          icon: "🔀",
          title: "Conditions",
        },
        {
          id: "loops",
          icon: "🔁",
          title: "Loops",
        },
      ],
    },
  ];

  const introBlock = {
    id: 1,
    type: "content",
    title: null,
    icon: null,

    data: {
      elements: [
        {
          type: "paragraph",
          text:
            "Imagine you're building something amazing. You need tools, building blocks and a way to make everything work together.",
        },
        {
          type: "paragraph",
          text:
            ".NET is a development platform that gives developers the tools, libraries and runtime they need to build and run applications.",
        },
      ],
    },
  };

  const toolboxBlock = {
    id: 2,
    type: "content",
    title: "Think of .NET as a toolbox",
    icon: "🧰",

    data: {
      elements: [
        {
          type: "paragraph",
          text:
            "A toolbox contains different tools for different jobs. .NET works in a similar way.",
        },
        {
          type: "callout",
          text:
            "It provides the pieces developers need to create web applications, APIs, desktop applications, cloud services and more.",
        },
      ],
    },
  };

  return (
    <div className="adventure-preview">
      <header className="adventure-preview__topbar">
        <div className="adventure-preview__brand">
          <span className="adventure-preview__brand-icon">
            🗺️
          </span>

          <div>
            <strong>
              .NET Adventure Land
            </strong>

            <small>
              Learn .NET Core by playing
            </small>
          </div>
        </div>

        <div className="adventure-preview__progress">
          ⭐ 0
        </div>
      </header>

      <div className="adventure-preview__layout">
        <aside className="adventure-preview__sidebar">
          <div className="adventure-preview__index-title">
            Course Index
          </div>

          {courseIndex.map(
            (section, sectionIndex) => (
              <div
                className="adventure-preview__index-section"
                key={sectionIndex}
              >
                <div className="adventure-preview__section-title">
                  {section.title}
                </div>

                <div className="adventure-preview__topic-list">
                  {section.topics.map(
                    (topic) => (
                      <button
                        type="button"
                        key={topic.id}
                        className={
                          activeTopic ===
                          topic.id
                            ? "adventure-preview__topic active"
                            : "adventure-preview__topic"
                        }
                        onClick={() =>
                          setActiveTopic(
                            topic.id
                          )
                        }
                      >
                        <span>
                          {topic.icon}
                        </span>

                        <span>
                          {topic.title}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </aside>

        <main className="adventure-preview__main">
          <article className="lesson">
            <div className="crumb">
              .NET Adventure Land
              {" · "}
              Meet .NET
            </div>

            <h1>
              <span className="t">
                🌐 What is .NET?
              </span>
            </h1>

            <div className="adventure-preview__mascot">
              <div
                className="adventure-preview__mascot-face"
                aria-hidden="true"
              >
                🟢
              </div>

              <div className="adventure-preview__speech">
                <strong>
                  Hi! I'm Dotty.
                </strong>

                <span>
                  Let's discover what .NET
                  is and why developers
                  use it.
                </span>
              </div>
            </div>

            <ContentBlock
              block={introBlock}
            />

            <ContentBlock
              block={toolboxBlock}
            />

            <div className="adventure-preview__pager">
              <button
                type="button"
                className="btn ghost"
              >
                ← Back
              </button>

              <button
                type="button"
                className="btn"
              >
                Next topic →
              </button>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

export default AdventurePreviewPage;