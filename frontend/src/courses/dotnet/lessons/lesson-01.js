const lesson01 = {
  id: "meet-dotnet",

  slug: "meet-dotnet",

  title: "Meet .NET",

  icon: "🌍",

  description:
    "Discover what .NET is and how it helps developers build applications.",

  position: 1,

  topics: [
    {
      id: "what-is-dotnet",

      slug: "what-is-dotnet",

      title: "What is .NET?",

      icon: "🌐",

      position: 1,

      blocks: [
        /*
         * -----------------------------------------
         * Block 1
         *
         * No title/icon intentionally.
         *
         * The Topic already displays:
         *
         * 🌐 What is .NET?
         * -----------------------------------------
         */

        {
          id: "dotnet-introduction",

          type: "content",

          content: `
            <p>
              Imagine you're building something amazing.
              You need tools, building blocks and a way
              to make everything work together.
            </p>

            <p>
              <strong>.NET</strong> is a development
              platform that gives developers the tools,
              libraries and runtime they need to build
              and run applications.
            </p>
          `,
        },

        /*
         * -----------------------------------------
         * Block 2
         *
         * Unlike the first block, this Content block
         * has its own heading.
         * -----------------------------------------
         */

        {
          id: "dotnet-toolbox",

          type: "content",

          title: "Think of .NET as a toolbox",

          icon: "🧰",

          content: `
            <p>
              A toolbox contains different tools for
              different jobs. .NET works in a similar
              way.
            </p>

            <p>
              It provides the pieces developers need
              to create web applications, APIs,
              desktop applications, cloud services
              and more.
            </p>
          `,
        },

        /*
         * -----------------------------------------
         * Block 3 — Quiz
         * -----------------------------------------
         */

        {
          id: "what-is-dotnet-quiz",

          type: "quiz",

          title: "Quick Check",

          icon: "🧠",

          instructions:
            "Choose the best answer.",

          passingScore: 100,

          allowRetry: true,

          questions: [
            {
              id: "question-1",

              type: "multiple_choice",

              question:
                "Which description best explains .NET?",

              options: [
                "A programming language",
                "A development platform",
                "A database",
                "An operating system",
              ],

              correctAnswer: 1,

              correctMessage:
                "Correct! 🎉",

              wrongMessage:
                "Not quite right. Think about what provides developers with the runtime, libraries and tools.",

              explanation:
                ".NET is a development platform. It provides a runtime, libraries, tools and other components developers use to build and run applications.",
            },
          ],
        },
      ],
    },
  ],
};

export default lesson01;