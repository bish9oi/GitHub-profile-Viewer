
async function fetchProfile() {
    const username = document.getElementById("username").value;
    const profileDiv = document.getElementById("profile");
    const reposDiv = document.getElementById("repositories");
    const techStackDiv = document.getElementById("tech-stack");
    const contributionsDiv = document.getElementById("contributions");
    const languageChart = document.getElementById("languageChart").getContext("2d");

    if (!username) {
        alert("Please enter a GitHub username!");
        return;
    }

    const userUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos`;

    try {
        const userResponse = await fetch(userUrl);
        if (!userResponse.ok) throw new Error("User not found!");
        const userData = await userResponse.json();

        profileDiv.innerHTML = `
            <div class="profile-card">
                <img src="${userData.avatar_url}" alt="Avatar">
                <h2>${userData.name || "No Name"}</h2>
                <p>@${userData.login}</p>
                <p>Followers: ${userData.followers} | Following: ${userData.following}</p>
                <p>Repositories: ${userData.public_repos}</p>
                <a href="${userData.html_url}" target="_blank">View Profile</a>
            </div>
        `;

        fetchRepositories(reposUrl, languageChart, reposDiv, techStackDiv);
        fetchContributions(username, contributionsDiv);
    } catch (error) {
        profileDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

async function fetchRepositories(reposUrl, languageChart, reposDiv, techStackDiv) {
    try {
        const repoResponse = await fetch(reposUrl);
        const repos = await repoResponse.json();

        let languages = {};
        let techStack = new Set();
        reposDiv.innerHTML = "";

        // const knownLibraries = ["react", "redux", "tailwind", "next.js", "express", "node.js"];

        const knownLibraries = [
           // Frontend
           "react", "redux", "next.js", "vue.js", "nuxt.js", "angular", "svelte",
           "tailwind", "bootstrap", "chakra-ui", "mui", "ant-design",

           // Backend
           "express", "node.js", "nestjs", "fastify", "koa", "hapi", "adonisjs",

           // API & GraphQL
           "apollo-server", "graphql", "restify", "trpc",

           // Database & ORMs
           "mongoose", "prisma", "sequelize", "typeorm", "knex.js",

           // Authentication & Security
           "passport.js", "jsonwebtoken", "bcrypt", "clerk", "next-auth",

           // Serverless & Cloud
           "firebase", "aws-sdk", "supabase", "vercel", "cloudflare workers",

           // Testing
           "jest", "mocha", "chai", "cypress", "playwright",

           // State Management
           "zustand", "recoil", "mobx", "vuex", "pinia",

           // AI & ML
           "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm",
           "numpy", "pandas", "scipy", "matplotlib", "seaborn", "plotly",
           "spacy", "nltk", "transformers", "opencv", "mediapipe", "tesseract.js",
           "openai", "huggingface", "stable-diffusion", "llama.cpp",
           "gym", "stable-baselines3", "ray[rllib]",
           "tensorflow-serving", "torchserve", "onnx", "fastapi", "flask", "gradio",
           "langchain", "pinecone", "weaviate", "chromadb", "faiss"
        ];
        
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }

            knownLibraries.forEach(lib => {
                if (repo.description && repo.description.toLowerCase().includes(lib)) {
                    techStack.add(lib);
                }
            });


            reposDiv.innerHTML += `
                <div class="repo-card">
                    <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                    <p>${repo.description || "No description available."}</p>
                    <p>⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}</p>
                    <p>🖥️ Language: ${repo.language || "Not specified"}</p>
                </div>
            `;
        });

        createLanguageChart(languages, languageChart);
        
        techStackDiv.innerHTML = `<div class="tech-card"><h3>Tech Stack</h3><p>${[...techStack].join(", ") || "No libraries detected"}</p></div>`;
    } catch (error) {
        console.error("Error fetching repositories:", error);
    }
}


async function fetchContributions(username, contributionsDiv) {
    const query = `
    {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }`;

    try {
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer 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`  // Replace with your token
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        console.log("API Response:", data);  // Log API response to debug

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        if (data.data && data.data.user) {
            const totalContributions = data.data.user.contributionsCollection.contributionCalendar.totalContributions;
            contributionsDiv.innerHTML = `
                <div class="contribution-card">
                    <h3>GitHub Contributions (Last Year)</h3>
                    <p>Total Contributions: <strong>${totalContributions}</strong></p>
                    <p>See Contributions <a href="https://github.com/${username}" target="_blank">here</a></p>
                </div>`;
        } else {
            throw new Error("User not found or contributions data is missing");
        }
    } catch (error) {
        console.error("Error fetching contributions:", error);
        contributionsDiv.innerHTML = `<p style="color:red;">Could not fetch contributions. ${error.message}</p>`;
    }
}



function createLanguageChart(languages, ctx) {
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(languages),
            datasets: [{
                data: Object.values(languages),
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"]
            }]
        }
    });
}

document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

async function fetchWithRateLimit(userUrl) {
    try {
        const response = await fetchWithAuth(userUrl);
        if (response.status === 403) {
            console.warn("Rate limit exceeded. Try again later.");
            return null;
        }
        return response.json();
    } catch (error) {
        console.error("API request failed:", error);
        return null;
    }
}
